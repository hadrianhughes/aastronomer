import { Runtime } from '@aws-cdk/aws-lambda'

export const PYTHON_RUNTIME = Runtime.PYTHON_3_8
export const API_CACHE_TTL_MINUTES = 15
export const SWAGGER_CACHE_TTL_DAYS = 7

export type Dict<T> = { [key: string]: T }
