import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as apig from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import { PYTHON_RUNTIME } from './globals'
import * as lambda from '@aws-cdk/aws-lambda-python'

export class PlanetsAPI extends cdk.Construct {
  public readonly api: apig.HttpApi

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    // Create layers
    const astroLayer = new lambda.PythonLayerVersion(this, 'AstroLayer', {
      entry: path.join(__dirname, '..', 'lambda', 'layers', 'astro'),
      compatibleRuntimes: [PYTHON_RUNTIME],
      description: 'A Python layer containing the core logic for the API'
    })


    // Create Lambda functions
    const getVisibleLambda = new lambda.PythonFunction(this, 'GetVisibleFunction', {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambda', 'handlers', 'getVisible'),
      handler: 'get_visible_handler',
      layers: [astroLayer]
    })

    const getVisibleIntegration = new LambdaProxyIntegration({
      handler: getVisibleLambda
    })


    // Create API
    this.api = new apig.HttpApi(this, 'HttpAPI', {
      apiName: 'planets-api'
    })

    this.api.addRoutes({
      path: '/visible',
      methods: [apig.HttpMethod.GET],
      integration: getVisibleIntegration
    })


    // Generate outputs
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: this.api.url!,
      exportName: 'APIEndpoint'
    })
  }
}
