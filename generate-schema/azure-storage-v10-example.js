/*
* Microsoft recommends this new "v10" SDK for Azure storage requests.
* It just didn't want to work for me, so I decided to use the older V2
* SDK. However, I realised that it's "blobs" and not "files" that
* we want, so perhaps if this was switched to blobs, it would work.
* Having said that, I think this code is overly verbose and prefer
* the V2 SDK (even though it uses cranky old callbacks).
*/

const {
  SharedKeyCredential,
  uploadFileToAzureFile,
  Aborter,
  FileURL,
  DirectoryURL,
  ShareURL,
  ServiceURL,
  StorageURL
 } = require('@azure/storage-file')

const uploadSchemaToStorage = async () => {
  const account = ''
  const accountKey = ''
  const timestamp = new Date().getTime()
  const aborter = Aborter.none

  try {
    const sharedKeyCredentials = new SharedKeyCredential(account, accountKey)

    const pipelineOptions = {
      retryOptions: { maxTries: 4 },
      telemetry: { value: 'generate-schema' }
    }

    const pipeline = StorageURL.newPipeline(sharedKeyCredentials, pipelineOptions)

    const serviceAccountUrl = `https://${account}.blob.core.windows.net`
    const serviceUrl = new ServiceURL(serviceAccountUrl, pipeline)

    const shareName = 'kentico-cloud-schema'
    const shareUrl = ShareURL.fromServiceURL(serviceUrl, shareName)
    await shareUrl.create(aborter)
    console.log(`Create share ${shareName} successfully`)

    const directoryName = 'kentico-cloud-schema'
    const directoryUrl = DirectoryURL.fromShareURL(shareUrl, directoryName)
    await directoryUrl.create(aborter)
    console.log(`Create directory ${directoryName} successfully`)

    const fileName = 'kentico-cloud-schema.graphql'
    const fileUrl = FileURL.fromDirectoryURL(directoryUrl, fileName)
    const localFilePath = process.env.KENTICO_CLOUD_SCHEMA_OUTPUT

    await uploadFileToAzureFile(aborter, localFilePath, fileUrl, {
      fileHTTPHeaders: {
        fileContentType: 'application/json',
      },
      rangeSize: 4 * 1024 * 1024, // 4MB range size
      parallelism: 20, // 20 concurrency
      progress: ev => console.log(ev)
    })
    console.log('uploadFileToAzureFile success')
  } catch (error) {
    console.warn('uploadFileToAzureFile error', error)
  }
}
