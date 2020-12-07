import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { Dict } from './globals'

export class EdgeHandler extends cdk.Construct {
  public readonly layers: Dict<lambda.ILayerVersion>
  public readonly edgeFunctions: Dict<lambda.IVersion>
  private stack: cdk.Stack

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.stack = scope as cdk.Stack

    this.layers =
      ['Astro', 'Common', 'Geo']
      .reduce((acc: Dict<lambda.ILayerVersion>, name: string) => {
        const resource = this.loadParameter(name)
        const arn = resource.getResponseField('Parameter.Value')

        return {
          ...acc,
          [name]: lambda.LayerVersion.fromLayerVersionArn(this, `${name}LayerVersion`, arn)
        }
      }, {})

    this.edgeFunctions =
      ['TestEdge']
      .reduce((acc: Dict<lambda.IVersion>, name: string) => {
        const resource = this.loadParameter(name)
        const arn = resource.getResponseField('Parameter.Value')

        return {
          ...acc,
          [name]: lambda.Version.fromVersionArn(this, `${name}EdgeVersion`, arn)
        }
      }, {})
  }

  private loadParameter(name: string): cr.AwsCustomResource {
    return new cr.AwsCustomResource(this, `Get${name}Parameter`, {
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetParameter*'],
          resources: [
            this.stack.formatArn({
              service: 'ssm',
              region: 'us-east-1',
              resource: `parameter/PlanetsAPI/${name}`
            })
          ]
        })
      ]),
      onUpdate: {
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: `/PlanetsAPI/${name}`
        },
        region: 'us-east-1',
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString())
      }
    })
  }
}
