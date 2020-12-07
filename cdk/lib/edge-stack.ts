import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import * as iam from '@aws-cdk/aws-iam'
import * as ssm from '@aws-cdk/aws-ssm'
import { PYTHON_RUNTIME, Dict } from './globals'

export type ResourcePile = {
  layers: Dict<string>,
  functions: Dict<string>
}

interface EdgeStackProps {
  exportName: string
}

export class EdgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EdgeStackProps) {
    super(scope, id, {
      env: {
        region: 'us-east-1'
      }
    })

    // Make layers
    const layers: Dict<string> = {
      'astro': this.makeLayer('AstroLayer', 'A Python layer containing the core logic for the API', 'astro'),
      'common': this.makeLayer('CommonLayer', 'A Python layer containing utility functions to be used across the project', 'common'),
      'geo': this.makeLayer('GeoLayer', 'A Python layer containing the logic for geographical positioning', 'geo')
    }

    // Make Lambda@Edge functions
    const testEdgeFunction = this.makeEdgeFunction('TestEdgeFunction', 'test_edge')

    const resourcePile: ResourcePile = {
      layers,
      functions: { testEdgeFunction }
    }

    const resourcesBase64: string = Buffer.from(
      JSON.stringify(resourcePile)
    ).toString('base64')

    new ssm.StringParameter(this, props.exportName, {
      parameterName: `/PlanetsAPI/${props.exportName}`,
      description: 'CDK parameter for Lambda@Edge functions and layers',
      stringValue: resourcesBase64
    })
  }

  private makeLayer(name: string, description: string, dir: string): string {
    return new lambda.PythonLayerVersion(this, name, {
      entry: path.join(__dirname, '..', 'lambda', 'layers', dir),
      compatibleRuntimes: [PYTHON_RUNTIME],
      description
    }).layerVersionArn
  }

  private makeEdgeFunction(name: string, dir: string): string {
    return new lambda.PythonFunction(this, name, {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambda', 'edge', dir),
      handler: 'handler',
      role: new iam.Role(this, 'AllowLambdaServiceToAssumeRole', {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal('lambda.amazonaws.com'),
          new iam.ServicePrincipal('edgelambda.amazonaws.com')
        ),
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
      })
    }).currentVersion.functionArn
  }
}
