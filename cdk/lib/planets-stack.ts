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

const sha256 = require('sha256-file')

interface PlanetsStackProps extends cdk.StackProps {
  LAMBDA_EDGE_PARAMETER_NAME: string
}

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PlanetsStackProps) {
    super(scope, id, props);

    const edgeParameter = new cr.AwsCustomResource(this, 'GetParameter', {
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetParameter*'],
          resources: [
            this.formatArn({
              service: 'ssm',
              region: 'us-east-1',
              resource: `parameter/PlanetsAPI/${props.LAMBDA_EDGE_PARAMETER_NAME}`
            })
          ]
        })
      ]),
      onUpdate: {
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: `/PlanetsAPI/${props.LAMBDA_EDGE_PARAMETER_NAME}`
        },
        region: 'us-east-1',
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString())
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
                  lambdaFunction: lambda.Version.fromVersionArn(
                    this,
                    'EdgeTestVersion',
                    edgeParameter.getResponseField('Parameter.Value')
                  )
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
