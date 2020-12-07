#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'
import { EdgeStack } from '../lib/edge-stack'

const EDGE_RESOURCES_NAME = 'EdgeResources64'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, 'EdgeStack', { exportName: EDGE_RESOURCES_NAME })

new PlanetsStack(app, 'PlanetsStack', {
  edgeExportName: EDGE_RESOURCES_NAME
}).addDependency(edgeStack);
