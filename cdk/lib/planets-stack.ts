import * as path from 'path'
import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cr from '@aws-cdk/custom-resources'
import * as iam from '@aws-cdk/aws-iam'
import { AllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'
import { PlanetsLambdaLibrary } from './lambda'
import { EdgeHandler } from './edge-handler'

const sha256 = require('sha256-file')

interface PlanetsStackProps extends cdk.StackProps {
  LAMBDA_EDGE_PARAMETER_NAME: string
}

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PlanetsStackProps) {
    super(scope, id, props);

    const planetsLambdas = new PlanetsLambdaLibrary(this, 'PlanetsLambdas')

    const api = new PlanetsAPI(this, 'PlanetsAPI', { lambdaLibrary: planetsLambdas })
    Tags.of(api).add('Module', 'API')

    const edgeHandler = new EdgeHandler(this, 'EdgeHandler', {
      stack: this,
      parameterName: props.LAMBDA_EDGE_PARAMETER_NAME
    })

    const distribution = new cf.CloudFrontWebDistribution(this, 'CFDistribution', {
      originConfigs: [
        {
          customOriginSource: {
            domainName: `${api.api.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`
          },
          behaviors: [
            {
              pathPattern: '/visible/*',
              isDefaultBehavior: true
            },
            {
              pathPattern: '/test_edge',
              lambdaFunctionAssociations: [
                {
                  eventType: cf.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: edgeHandler.getVersion('EdgeTest')
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
