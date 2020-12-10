import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import { CloudFrontAllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'
import { PlanetsLambdaLibrary } from './lambda'
import { EdgeHandler } from './edge-handler'
import { Swagger } from './swagger'

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

    // Set up S3 bucket for Swagger page
    const swagger = new Swagger(this, 'PlanetsSwaggerBucket')
    Tags.of(swagger).add('Module', 'Swagger')

    // Create CF Origin identity to allow read access to S3 bucket
    const cfS3Identity = new cf.OriginAccessIdentity(this, 'SwaggerS3OriginIdentity', {
      comment: 'Created by CDK for Planets API'
    })

    const distribution = new cf.CloudFrontWebDistribution(this, 'CFDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: swagger.bucket,
            originAccessIdentity: cfS3Identity
          },
          behaviors: [
            {
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              isDefaultBehavior: true
            }
          ]
        },
        {
          customOriginSource: {
            domainName: `${api.api.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`
          },
          behaviors: [
            {
              pathPattern: '/api/visible',
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
                }
              ]
            },
            {
              pathPattern: '/api/*',
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
            }
          ]
        }
      ]
    })
    Tags.of(distribution).add('Module', 'CFDistribution')

    // Grant our CF identity access to the Swagger bucket
    swagger.grantAccessForIdentity(cfS3Identity)

    // Deploy changes to Swagger S3 bucket
    swagger.deployBucket(distribution)

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
