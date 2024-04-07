import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'
import { Cloudflare } from 'cloudflare'
import { config as dotenvConfig } from 'dotenv'
import { readFile } from 'fs/promises'
import { join as pathJoin } from 'path'
import { rimraf } from 'rimraf'
import { awaitSpawn } from '../lib/utils/await-spawn'
import { hasMissingEnvVar } from '../lib/utils/env-variables'
import { logCommand, logHeader, logSpawnCommand } from '../lib/utils/log'

interface CdkOutput {
  stackName: string
  s3BucketName: string
  distributionId: string
  distributionHostName: string
}

export class WebsiteDeployer {
  cdkOutputFilePath: string

  constructor() {
    this.cdkOutputFilePath = pathJoin(process.cwd(), 'cdk-output-data')
  }

  deploy = async () => {
    this.setup()
    await this.deployCdk()
    const cdkOutput = await this.extractCdkOutput()
    await this.purgeCloudFrontCaches(cdkOutput)
    await this.purgeCloudFlareCache()
    await this.cleanup()
  }

  private setup = () => {
    dotenvConfig()
  }

  private cleanup = async () => {
    logHeader(`Clean up CDK output file if exists`)
    logCommand(this.cdkOutputFilePath)
    const result = await rimraf(this.cdkOutputFilePath)
    if (result) {
      console.log(`File deletion status: SUCCESS`)
    } else {
      console.warn(`File deletion status: FAIL`)
    }
  }

  private deployCdk = async () => {
    try {
      const cdk = 'cdk'
      const args1 = [`synth`]
      const args2 = [`deploy`, `--all`, `--outputs-file`, this.cdkOutputFilePath]

      logSpawnCommand(cdk, args1)
      await awaitSpawn(cdk, args1)

      logSpawnCommand(cdk, args2)
      await awaitSpawn(cdk, args2)
    } catch (error) {
      console.error('Error in deployCdk():', error)
      throw error
    }
  }

  private extractCdkOutput = async () => {
    logHeader('CDK Outputs')

    const cdkOutputFile = await readFile(this.cdkOutputFilePath)
    const cdkOutputs = JSON.parse(cdkOutputFile.toString())
    const result: CdkOutput[] = []

    for (const stackName in cdkOutputs) {
      const stackOutputs = cdkOutputs[stackName] as { [key: string]: string }
      let s3BucketName = ''
      let distributionId = ''
      let distributionHostName = ''
      for (const outputName in stackOutputs) {
        if (outputName.startsWith('bucketName')) {
          s3BucketName = stackOutputs[outputName]
        } else if (outputName.startsWith('distributionId')) {
          distributionId = stackOutputs[outputName]
        } else if (outputName.startsWith('distributionHostName')) {
          distributionHostName = stackOutputs[outputName]
        } else {
          console.warn(`CDK output name not recognized: ${outputName} (value: ${stackOutputs[outputName]})`)
        }
      }
      result.push({
        stackName,
        s3BucketName,
        distributionId,
        distributionHostName,
      })
      console.log()
      console.log(`stackName\t\t${stackName}`)
      console.log(`s3BucketName\t\t${s3BucketName}`)
      console.log(`distributionId\t\t${distributionId}`)
      console.log(`distributionHostName\t${distributionHostName}`)
    }

    return result
  }

  private purgeCloudFrontCaches = async (cdkOutputs: CdkOutput[]) => {
    logHeader('CloudFront Cache Purge')
    const client = new CloudFrontClient()

    for (const { distributionId } of cdkOutputs) {
      const command = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          Paths: {
            Quantity: 1,
            Items: ['/*'],
          },
          CallerReference: Date.now().toString(),
        },
      })
      const response = await client.send(command)
      const status = response.Invalidation?.Status
      console.log(`[CloudFront][${distributionId}] Cache purge status: ${status}`)
    }
  }

  // TODO enable cache purge for multiple zones at once
  private purgeCloudFlareCache = async () => {
    logHeader('CloudFlare Cache Purge')

    const {
      CLOUDFLARE_EMAIL,
      CLOUDFLARE_API_KEY,
      CLOUDFLARE_ZONE_ID,
    } = process.env
    if (hasMissingEnvVar([CLOUDFLARE_EMAIL, CLOUDFLARE_API_KEY, CLOUDFLARE_ZONE_ID])) {
      return
    }

    const cloudflare = new Cloudflare({
      apiEmail: CLOUDFLARE_EMAIL,
      apiKey: CLOUDFLARE_API_KEY,
    })
    // purge whole cache for this zone (purge by hostname only available with enterprise plan)
    const response = await cloudflare.cache.purge({
      zone_id: CLOUDFLARE_ZONE_ID!,
      purge_everything: true,
    })
    if (response?.id) {
      console.log(`[CloudFlare] Cache purge status: SUCCESS`)
    } else {
      console.warn(`[CloudFlare] Cache purge status: FAIL`)
    }
  }
}

(async () => {
  await new WebsiteDeployer().deploy()
})()
