import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import { Version } from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import { PYTHON_RUNTIME } from './globals'

const sha256 = require('sha256-file')

interface EdgeStackProps extends cdk.StackProps {
  LAMBDA_OUTPUT_NAME: string
}

export class EdgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EdgeStackProps) {
    super(scope, id, {
      env: {
        region: 'us-east-1'
      }
    })

    const testEdgeFunction = this.makeEdgeFunction('TestEdgeFunction', 'test_edge')

    new cdk.CfnOutput(this, props.LAMBDA_OUTPUT_NAME, {
      value: cdk.Fn.join(':', testEdgeFunction)
    })
  }

  private makeEdgeFunction(name: string, dir: string): [string, string] {
    const edgeFunction = new lambda.PythonFunction(this, name, {
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
    })

    const functionVersion = edgeFunction.addVersion(':sha256:' + sha256(path.join(__dirname, '..', 'lambda', 'edge', dir, 'index.py')))

    return [edgeFunction.functionArn, functionVersion.version]
  }
}
