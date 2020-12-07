import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import { CloudFrontAllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'
import { PlanetsLambdaLibrary } from './lambda'
import { EdgeHandler } from './edge-handler'

interface PlanetsStackProps extends cdk.StackProps {
  edgeExportName: string
}

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PlanetsStackProps) {
    super(scope, id, props);

    // Set up Lambda@Edge functions from EdgeStack us-east-1
    const edgeHandler = new EdgeHandler(this, 'EdgeHandler', { edgeExportName: props.edgeExportName })

    // Initialise Lambda assets
    const planetsLambdas = new PlanetsLambdaLibrary(this, 'PlanetsLambdas', { layers: edgeHandler.layers })

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
              pathPattern: '/visible/*',
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              isDefaultBehavior: true
            },
            {
              pathPattern: '/test_edge',
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              lambdaFunctionAssociations: [
                {
                  eventType: cf.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: edgeHandler.edgeFunctions.testEdgeFunction
                }
              ]
            }
          ]
        }
      ]
    })


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
