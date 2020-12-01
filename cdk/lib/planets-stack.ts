import * as path from 'path'
import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as cr from '@aws-cdk/custom-resources'
import { AllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'
import { PlanetsLambdaLibrary } from './lambda'

const sha256 = require('sha256-file')

interface PlanetsStackProps extends cdk.StackProps {
  LAMBDA_EDGE_STACK_NAME: string
  LAMBDA_OUTPUT_NAME: string
}

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PlanetsStackProps) {
    super(scope, id, props);

    const edgeLambdaProvider = new lambda.SingletonFunction(this, 'LambdaProvider', {
      uuid: 'f7d4f730-4ee1-11e8-9c2d-fa7ae01bbebc',
      code: lambda.Code.fromAsset('../cfn'),
      handler: 'stack.handler',
      timeout: cdk.Duration.seconds(60),
      runtime: lambda.Runtime.NODEJS_10_X
    })

    edgeLambdaProvider.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudformation:DescribeStacks'],
        resources: [`arn:aws:cloudformation:*:*:stack/${props.LAMBDA_EDGE_STACK_NAME}/*`]
      })
    )

    const edgeStackOutputProvider = new cr.Provider(this, 'EdgeStackOutputProvider', {
      onEventHandler: edgeLambdaProvider
    })

    const edgeStackOutput = new cdk.CustomResource(this, 'EdgeStackOutput', {
      serviceToken: edgeStackOutputProvider.serviceToken,
      properties: {
        StackName: props.LAMBDA_EDGE_STACK_NAME,
        OutputKey: props.LAMBDA_OUTPUT_NAME,
        LambdaHash: sha256(path.join(__dirname, '..', 'lambda', 'edge', 'test_edge', 'index.py'))
      }
    })

    const planetsLambdas = new PlanetsLambdaLibrary(this, 'PlanetsLambdas')

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
              isDefaultBehavior: true
            },
            {
              pathPattern: '/test_edge',
              lambdaFunctionAssociations: [
                {
                  eventType: cf.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: lambda.Version.fromVersionArn(this, 'EdgeFunctionVersion', edgeStackOutput.getAttString('Output'))
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
