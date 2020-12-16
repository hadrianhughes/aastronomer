#!/usr/bin/env node

require('dotenv').config()
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { AAStronomerStack } from '../lib/aastronomer-stack'
import { EdgeStack } from '../lib/edge-stack'

const app = new cdk.App();

const edgeStack = new EdgeStack(app, 'EdgeStack', {
  domainName: process.env.CUSTOM_DOMAIN_NAME!
})

new AAStronomerStack(app, 'PlanetsStack', {
  domainName: process.env.CUSTOM_DOMAIN_NAME!,
  env: {
    region: process.env.REGION
  }
}).addDependency(edgeStack);
