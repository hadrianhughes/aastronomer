import * as path from 'path'
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'

export class Swagger extends cdk.Construct {
  public readonly bucket: s3.Bucket

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.bucket = new s3.Bucket(this, 'SwaggerBucket', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html'
    })

    new s3Deploy.BucketDeployment(this, 'DeploySwaggerBucket', {
      sources: [s3Deploy.Source.asset(path.join(__dirname, '..', '..', 'swagger', 'build'))],
      destinationBucket: this.bucket
    })
  }
}
