#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'
import { EdgeStack } from '../lib/edge-stack'

const LAMBDA_EDGE_STACK_NAME = 'EdgeStack'
const LAMBDA_OUTPUT_NAME = 'EdgeOutput'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, LAMBDA_EDGE_STACK_NAME, {
  LAMBDA_OUTPUT_NAME
})

new PlanetsStack(app, 'PlanetsStack', {
  LAMBDA_EDGE_STACK_NAME,
  LAMBDA_OUTPUT_NAME
}).addDependency(edgeStack);
