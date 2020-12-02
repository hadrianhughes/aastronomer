#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'
import { EdgeStack } from '../lib/edge-stack'

const LAMBDA_EDGE_PARAMETER_NAME = 'EdgeTestARN'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, 'EdgeStack', {
  PARAMETER_NAME: LAMBDA_EDGE_PARAMETER_NAME
})

new PlanetsStack(app, 'PlanetsStack', {
  LAMBDA_EDGE_PARAMETER_NAME
}).addDependency(edgeStack);
