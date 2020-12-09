import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import * as iam from '@aws-cdk/aws-iam'
import * as ssm from '@aws-cdk/aws-ssm'
import { PYTHON_RUNTIME, Dict } from './globals'

export class EdgeStack extends cdk.Stack {
  private customIamRole: iam.Role

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id, {
      env: {
        region: 'us-east-1'
      }
    })

    // Create role for Lambda@Edge functions
    this.customIamRole = new iam.Role(this, 'AllowLambdaServiceToAssumeRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
    })

    // Make Lambda@Edge functions
    const edgeFunctions: Dict<string> = {
      'QueryToID': this.makeEdgeFunction('QueryToID', 'query_to_id'),
      'StripAPIPath': this.makeEdgeFunction('StripAPIPath', 'strip_api_path')
    }

    // Export an SSM Parameter for each function
    Object.keys(edgeFunctions).forEach(key => new ssm.StringParameter(this, `${key}ARN`, {
      parameterName: `/PlanetsAPI/${key}ARN`,
      description: `CDK parameter from ${key} Lambda@Edge function`,
      stringValue: edgeFunctions[key]
    }))
  }

  private makeEdgeFunction(name: string, dir: string): string {
    return new lambda.PythonFunction(this, name, {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambdas', 'edge', dir),
      handler: 'handler',
      role: this.customIamRole
    }).currentVersion.functionArn
  }
}
