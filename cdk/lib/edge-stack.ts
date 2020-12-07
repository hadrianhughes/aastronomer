import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import * as iam from '@aws-cdk/aws-iam'
import * as ssm from '@aws-cdk/aws-ssm'
import { PYTHON_RUNTIME } from './globals'

export class EdgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id, {
      env: {
        region: 'us-east-1'
      }
    })

    const testEdgeFunction = new lambda.PythonFunction(this, 'TestEdgeFunction', {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambda', 'edge', 'test_edge'),
      handler: 'handler',
      role: new iam.Role(this, 'AllowLambdaServiceToAssumeRole', {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal('lambda.amazonaws.com'),
          new iam.ServicePrincipal('edgelambda.amazonaws.com')
        ),
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
      })
    })

    new ssm.StringParameter(this, 'EdgeTestARN', {
      parameterName: `/PlanetsAPI/EdgeTestARN`,
      description: 'CDK parameter stored for cross-region Lambda@Edge function',
      stringValue: testEdgeFunction.currentVersion.functionArn
    })
  }
}
