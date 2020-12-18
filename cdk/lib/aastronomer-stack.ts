import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import { CloudFrontAllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { AAStronomerAPI } from './api'
import { AAStronomerLambdaLibrary } from './lambda'
import { EdgeHandler } from './edge-handler'
import { Swagger } from './swagger'
import { API_CACHE_TTL_MINUTES, SWAGGER_CACHE_TTL_DAYS } from './globals'

interface AAStronomerStackProps extends cdk.StackProps {
  domainName: string
}

export class AAStronomerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AAStronomerStackProps) {
    super(scope, id, props);

    // Set up Lambda@Edge functions from EdgeStack us-east-1
    const edgeHandler = new EdgeHandler(this, 'EdgeHandler')
    Tags.of(edgeHandler).add('Module', 'EdgeHandler')

    // Initialise Lambda assets
    const aastronomerLambdas = new AAStronomerLambdaLibrary(this, 'AAStronomerLambdas')
    Tags.of(aastronomerLambdas).add('Module', 'LambdaLibrary')

    // Set up API Gateway
    const api = new AAStronomerAPI(this, 'AAStronomerAPI', { lambdaLibrary: aastronomerLambdas })
    Tags.of(api).add('Module', 'API')

    // Set up S3 bucket for Swagger page
    const swagger = new Swagger(this, 'AAStronomerSwaggerBucket')
    Tags.of(swagger).add('Module', 'Swagger')

    // Create CF Origin identity to allow read access to S3 bucket
    const cfS3Identity = new cf.OriginAccessIdentity(this, 'SwaggerS3OriginIdentity', {
      comment: 'Created by CDK for AAStronomer'
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
              defaultTtl: cdk.Duration.days(SWAGGER_CACHE_TTL_DAYS),
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
              defaultTtl: cdk.Duration.minutes(API_CACHE_TTL_MINUTES),
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
              pathPattern: '/api/id',
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              defaultTtl: cdk.Duration.minutes(API_CACHE_TTL_MINUTES),
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
              defaultTtl: cdk.Duration.minutes(API_CACHE_TTL_MINUTES),
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
      ],
      viewerCertificate: {
        aliases: [props.domainName],
        props: {
          acmCertificateArn: edgeHandler.domainCertificateArn,
          sslSupportMethod: 'sni-only'
        }
      }
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
