#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { CloudFrontWebsiteStack } from '../lib/cloudfront-website-stack'

const app = new cdk.App()
// const BUILD_OUTPUT_PATH = '../../dist/WLED-Web-Client'
const BUILD_OUTPUT_PATH = '../../timstoddard.me-website/dist'

// Note to user, bucket region will be `aws configure` setting

// dev deployment
new CloudFrontWebsiteStack(app, 'CloudFrontWebsiteStack', {
  websiteUrl: 'dev.timstoddard.me',
  websiteDescription: 'dev personal site',
  publicSSLCertificateArn: 'arn:aws:acm:us-east-1:114243598814:certificate/603fe751-a806-4f82-a7ad-13e6b966a5a9',
  websiteBuildOutputPath: BUILD_OUTPUT_PATH,
  devMode: true,
})

// prod deployment
new CloudFrontWebsiteStack(app, 'CloudFrontWebsiteStack', {
  websiteUrl: 'timstoddard.me',
  websiteDescription: 'personal site',
  publicSSLCertificateArn: 'arn:aws:acm:us-east-1:114243598814:certificate/603fe751-a806-4f82-a7ad-13e6b966a5a9',
  websiteBuildOutputPath: BUILD_OUTPUT_PATH,
})
