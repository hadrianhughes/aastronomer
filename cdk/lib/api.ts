import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { Duration } from '@aws-cdk/core'
import * as apig from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import { PYTHON_RUNTIME } from './globals'
import * as lambda from '@aws-cdk/aws-lambda-python'
import { AAStronomerLambdaLibrary } from './lambda'

interface APIProps {
  lambdaLibrary: AAStronomerLambdaLibrary
}

export class AAStronomerAPI extends cdk.Construct {
  public readonly api: apig.HttpApi

  constructor(scope: cdk.Construct, id: string, props: APIProps) {
    super(scope, id)

    // Make integrations for lambdas
    const getVisibleByIDIntegration = new LambdaProxyIntegration({
      handler: props.lambdaLibrary.functions.getVisibleByID
    })

    const getIDIntegration = new LambdaProxyIntegration({
      handler: props.lambdaLibrary.functions.getID
    })

    // Create API
    this.api = new apig.HttpApi(this, 'HttpAPI', {
      apiName: 'planets-api',
      createDefaultStage: true
    })

    this.api.addRoutes({
      path: '/visible/{locationID}',
      methods: [apig.HttpMethod.GET],
      integration: getVisibleByIDIntegration
    })

    this.api.addRoutes({
      path: '/id/{locationID}',
      methods: [apig.HttpMethod.GET],
      integration: getIDIntegration
    })
  }
}
