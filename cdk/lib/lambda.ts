import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { Duration } from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import { ILayerVersion } from '@aws-cdk/aws-lambda'
import { PYTHON_RUNTIME, Dict } from './globals'

export class PlanetsLambdaLibrary extends cdk.Construct {
  public readonly layers: Dict<lambda.PythonLayerVersion> = {}
  public readonly functions: Dict<lambda.PythonFunction> = {}

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    // Create layers
    this.layers.astro = this.makeLayer('AstroLayer', 'A Python layer containing the core logic for the API', 'astro')
    this.layers.common = this.makeLayer('CommonLayer', 'A Python layer containing utility functions to be used across the project', 'common')
    this.layers.geo = this.makeLayer('GeoLayer', 'A Python layer containing the logic for geographical positioning', 'geo')

    // Create functions
    this.functions.getVisibleByID = this.makeFunction(
      'GetVisibleByID',
      'get_visible_by_id',
      [this.layers.astro, this.layers.common, this.layers.geo],
      {
        timeout: Duration.seconds(10),
        memorySize: 2048
      }
    )
  }

  private makeLayer(name: string, description: string, dir: string): lambda.PythonLayerVersion {
    return new lambda.PythonLayerVersion(this, name, {
      entry: path.join(__dirname, '..', 'lambdas', 'layers', dir),
      compatibleRuntimes: [PYTHON_RUNTIME],
      description
    })
  }

  private makeFunction(name: string, dir: string, layers: ILayerVersion[], props?: object) {
    return new lambda.PythonFunction(this, name, {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambdas', 'handlers', dir),
      handler: 'handler',
      layers,
      ...(props || {})
    })
  }
}
