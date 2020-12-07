import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { Duration } from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-python'
import { ILayerVersion } from '@aws-cdk/aws-lambda'
import { PYTHON_RUNTIME, Dict } from './globals'

interface LambdaLibraryProps {
  layers: Dict<ILayerVersion>
}

export class PlanetsLambdaLibrary extends cdk.Construct {
  public readonly functions: { [key: string]: lambda.PythonFunction | null } = {}

  constructor(scope: cdk.Construct, id: string, props: LambdaLibraryProps) {
    super(scope, id)

    // Create functions
    this.functions.getVisibleByID = this.makeFunction(
      'GetVisibleByID',
      'getVisibleByID',
      [props.layers.astro, props.layers.common, props.layers.geo],
      {
        timeout: Duration.seconds(10),
        memorySize: 2048
      }
    )
  }

  private makeLayer(name: string, description: string, dir: string): lambda.PythonLayerVersion {
    return new lambda.PythonLayerVersion(this, name, {
      entry: path.join(__dirname, '..', 'lambda', 'layers', dir),
      compatibleRuntimes: [PYTHON_RUNTIME],
      description
    })
  }

  private makeFunction(name: string, dir: string, layers: ILayerVersion[], props?: object) {
    return new lambda.PythonFunction(this, name, {
      runtime: PYTHON_RUNTIME,
      entry: path.join(__dirname, '..', 'lambda', 'handlers', dir),
      handler: 'handler',
      layers,
      ...(props || {})
    })
  }
}
