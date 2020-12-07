import { Runtime } from '@aws-cdk/aws-lambda'

export const PYTHON_RUNTIME = Runtime.PYTHON_3_8

export type Dict<T> = { [key: string]: T }
