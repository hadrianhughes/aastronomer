import * as path from 'path'
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import { IDistribution } from '@aws-cdk/aws-cloudfront'

export class Swagger extends cdk.Construct {
  public readonly bucket: s3.Bucket

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.bucket = new s3.Bucket(this, 'SwaggerBucket', {
      websiteIndexDocument: 'index.html',
      versioned: true
    })
  }

  public deployBucket(cfDistribution: IDistribution): void {
    new s3Deploy.BucketDeployment(this, 'DeploySwaggerBucket', {
      sources: [s3Deploy.Source.asset(path.join(__dirname, '..', '..', 'swagger', 'build'))],
      destinationBucket: this.bucket,
      distribution: cfDistribution
    })
  }
}
