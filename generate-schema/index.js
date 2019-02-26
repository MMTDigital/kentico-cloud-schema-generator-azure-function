const { exec } = require('child_process')
const { promisify } = require('util')
const asyncExec = promisify(exec)
const azure = require('azure-storage')

const blobService = azure.createBlobService()

const generateSchema = () => asyncExec('npm run generate-schema')

const createBlob = (context, blobContainerName) => {
  return new Promise((resolve, reject) => {
    context.log('Creating blob...')
    const blobFileName = 'kentico-cloud-schema.graphql'
    blobService.createBlockBlobFromLocalFile(
        blobContainerName,
        blobFileName,
        process.env.KENTICO_CLOUD_SCHEMA_OUTPUT,
        (error, result, response) => {
          if (!error) resolve(result)
          if (error) reject({ error, response })
      }
    )
  })
}

const createBlobContainer = (context, blobContainerName) => {
  return new Promise((resolve, reject) => {
    context.log('Creating container if one does not exist')
    const blobOptions = { publicAccessLevel: 'blob' }
    blobService.createContainerIfNotExists(
      blobContainerName,
      blobOptions,
      (error, result, response) => {
        if (!error) resolve(result)
        if (error) reject({ error, response })
      }
    )
  })
}

const uploadBlob = async (context) => {
  const blobContainerName = 'kentico-cloud-schema'
  await createBlobContainer(context, blobContainerName)
  await createBlob(context, blobContainerName)
}

module.exports = async (context, request) => {
  context.log('Kentico Cloud Schema Generator Request Received')

  try {
    await generateSchema()
    await uploadBlob(context)
  } catch (error) {
    context.log.error(error)
  }
}
