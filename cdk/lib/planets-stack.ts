import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront'
import { AllowedMethods } from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new PlanetsAPI(this, 'PlanetsAPI')
    Tags.of(api).add('Module', 'API')

    const cfDistribution = new cf.Distribution(this, 'PlanetsCF', {
      defaultBehavior: {
        origin: new HttpOrigin(`${api.api.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
      }
    })

    new cdk.CfnOutput(this, 'CFDomain', {
      value: cfDistribution.domainName,
      exportName: 'CFDomain'
    })
  }
}
