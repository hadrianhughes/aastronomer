#!/usr/bin/env node
require('dotenv').config()
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'
import { EdgeStack } from '../lib/edge-stack'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, 'EdgeStack', {
  domainName: process.env.CUSTOM_DOMAIN_NAME!
})

new PlanetsStack(app, 'PlanetsStack', {
  domainName: process.env.CUSTOM_DOMAIN_NAME!
}).addDependency(edgeStack);
