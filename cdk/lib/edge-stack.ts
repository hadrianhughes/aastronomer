import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import * as iam from '@aws-cdk/aws-iam'
import * as ssm from '@aws-cdk/aws-ssm'
import { PYTHON_RUNTIME, Dict } from './globals'

export class EdgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id, {
      env: {
        region: 'us-east-1'
      }
    })

    // Make layers
    const layers: Dict<string> = {
      'Astro': this.makeLayer('AstroLayer', 'A Python layer containing the core logic for the API', 'astro'),
      'Common': this.makeLayer('CommonLayer', 'A Python layer containing utility functions to be used across the project', 'common'),
      'Geo': this.makeLayer('GeoLayer', 'A Python layer containing the logic for geographical positioning', 'geo')
    }

    // Make Lambda@Edge functions
    const edgeFunctions: Dict<string> = {
      'TestEdge': this.makeEdgeFunction('TestEdge', 'test_edge')
    }

    Object.keys(layers).forEach(key => new ssm.StringParameter(this, `${key}ARN`, {
      parameterName: `/PlanetsAPI/${key}ARN`,
      description: `CDK parameter for ${key} Lambda Layer`,
      stringValue: layers[key]
    }))

    Object.keys(edgeFunctions).forEach(key => new ssm.StringParameter(this, `${key}ARN`, {
      parameterName: `/PlanetsAPI/${key}ARN`,
      description: `CDK parameter from ${key} Lambda@Edge function`,
      stringValue: edgeFunctions[key]
    }))
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
