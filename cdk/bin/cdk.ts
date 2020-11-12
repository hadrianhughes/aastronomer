#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { PlanetsStack } from '../lib/planets-stack'

const app = new cdk.App();
new PlanetsStack(app, 'PlanetsStack');
