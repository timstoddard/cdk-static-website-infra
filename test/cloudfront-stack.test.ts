import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudFrontWebsiteStack } from '../lib/cloudfront-website-stack';

test('SQS Queue and SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CloudFrontWebsiteStack(app, 'MyTestStack', {
    websiteUrl: '',
    websiteDescription: '',
    publicSSLCertificateArn: '',
    websiteBuildOutputPath: '',
  });
  // THEN

  const template = Template.fromStack(stack);

  // template.hasResourceProperties('AWS::SQS::Queue', {
  //   VisibilityTimeout: 300
  // });
  // template.resourceCountIs('AWS::SNS::Topic', 1);
});
