import * as cdk from '@aws-cdk/core'
import * as apig from '@aws-cdk/aws-apigatewayv2'

export class PlanetsAPI extends cdk.Construct {
  public readonly api: apig.HttpApi

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.api = new apig.HttpApi(this, 'HttpAPI', {
      apiName: 'planets-api'
    })
  }
}
