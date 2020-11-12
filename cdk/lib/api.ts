import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as apig from '@aws-cdk/aws-apigatewayv2'
import * as lambda from '@aws-cdk/aws-lambda'

export class PlanetsAPI extends cdk.Construct {
  public readonly api: apig.HttpApi

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    // Create layers
    const astroLayer = new lambda.LayerVersion(this, 'AstroLayer', {
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          '..',
          'lambda',
          'layers',
          'astro'
        )
      ),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      description: 'A Python layer containing the core logic for the API'
    })

    this.api = new apig.HttpApi(this, 'HttpAPI', {
      apiName: 'planets-api'
    })
  }
}
