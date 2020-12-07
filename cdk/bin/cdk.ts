#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'
import { EdgeStack } from '../lib/edge-stack'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, 'EdgeStack')

new PlanetsStack(app, 'PlanetsStack').addDependency(edgeStack);
