#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { CloudFrontStack } from '../lib/cloudfront-stack'

const app = new cdk.App()

// Note to user, bucket region will be `aws configure` setting
new CloudFrontStack(app, 'CloudFrontStack', {
  websiteUrl: 'dev.timstoddard.me',
  websiteDescription: 'dev personal site',
  publicSSLCertificateArn: 'arn:aws:acm:us-east-1:114243598814:certificate/163adeef-207b-49dd-ad8d-63b78e0e262a',
})
