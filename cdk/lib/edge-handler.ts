import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { Dict } from './globals'

interface EdgeHandlerProps {
  edgeExportName: string
}

export class EdgeHandler extends cdk.Construct {
  public readonly layers: Dict<lambda.ILayerVersion>
  public readonly edgeFunctions: Dict<lambda.IVersion>

  constructor(scope: cdk.Construct, id: string, props: EdgeHandlerProps) {
    super(scope, id)

    const resourcesBase64 = new cr.AwsCustomResource(this, 'GetParameter', {
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetParameter*'],
          resources: [
            (scope as cdk.Stack).formatArn({
              service: 'ssm',
              region: 'us-east-1',
              resource: `parameter/PlanetsAPI/${props.edgeExportName}`
            })
          ]
        })
      ]),
      onUpdate: {
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: `/PlanetsAPI/${props.edgeExportName}`
        },
        region: 'us-east-1',
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString())
      }
    }).getResponseField('Parameter.Value')

    const { layers, functions } = JSON.parse(Buffer.from(resourcesBase64, 'base64').toString('utf-8'))

    if (!layers || !functions) {
      throw new ReferenceError('Importing Lambda@Edge and Lambda Layers from us-east-1 failed.')
    }

    this.layers = Object.keys(layers).reduce<Dict<lambda.ILayerVersion>>((acc, k) => ({
      [k]: lambda.LayerVersion.fromLayerVersionArn(
        this,
        `${k}LayerVersion`,
        layers[k]
      )
    }), {})

    this.edgeFunctions = Object.keys(functions).reduce<Dict<lambda.IVersion>>((acc, k) => ({
      [k]: lambda.Version.fromVersionArn(
        this,
        `${k}EdgeVersion`,
        functions[k]
      )
    }), {})
  }
}
