import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import { CloudFrontAllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'
import { PlanetsLambdaLibrary } from './lambda'
import { EdgeHandler } from './edge-handler'

const CACHE_TTL_MINUTES = 15

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // Set up Lambda@Edge functions from EdgeStack us-east-1
    const edgeHandler = new EdgeHandler(this, 'EdgeHandler')
    Tags.of(edgeHandler).add('Module', 'EdgeHandler')

    // Initialise Lambda assets
    const planetsLambdas = new PlanetsLambdaLibrary(this, 'PlanetsLambdas')
    Tags.of(planetsLambdas).add('Module', 'LambdaLibrary')

    // Set up API Gateway
    const api = new PlanetsAPI(this, 'PlanetsAPI', { lambdaLibrary: planetsLambdas })
    Tags.of(api).add('Module', 'API')

    const distribution = new cf.CloudFrontWebDistribution(this, 'CFDistribution', {
      originConfigs: [
        {
          customOriginSource: {
            domainName: `${api.api.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              defaultTtl: cdk.Duration.minutes(CACHE_TTL_MINUTES),
              forwardedValues: {
                queryString: true
              },
              lambdaFunctionAssociations: [
                {
                  eventType: cf.LambdaEdgeEventType.ORIGIN_REQUEST,
                  lambdaFunction: edgeHandler.edgeFunctions.StripAPIPath
                }
              ]
            },
            {
              pathPattern: '/visible',
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              defaultTtl: cdk.Duration.minutes(CACHE_TTL_MINUTES),
              forwardedValues: {
                queryString: true
              },
              lambdaFunctionAssociations: [
                {
                  eventType: cf.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: edgeHandler.edgeFunctions.QueryToID
                },
                {
                  eventType: cf.LambdaEdgeEventType.ORIGIN_REQUEST,
                  lambdaFunction: edgeHandler.edgeFunctions.StripAPIPath
                },
              ]
            }
          ]
        }
      ]
    })
    Tags.of(distribution).add('Module', 'CFDistribution')


    // Generate outputs
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.api.url!,
      exportName: 'APIEndpoint'
    })

    new cdk.CfnOutput(this, 'CFDomain', {
      value: distribution.distributionDomainName,
      exportName: 'CFDomain'
    })
  }
}
