import * as cdk from '@aws-cdk/core';
import { Tags } from '@aws-cdk/core'
import { PlanetsAPI } from './api'

export class PlanetsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new PlanetsAPI(this, 'PlanetsAPI')
    Tags.of(api).add('Module', 'API')
  }
}
