const azure = require('azure-storage')

const createBlob = (context, blobContainerName, schema, blobService) => {
  context.log('Creating blob...')

  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(
        blobContainerName,
        process.env.SCHEMA_STORAGE_BLOB_NAME,
        schema,
        (error, result, response) => {
          if (!error) resolve(result)
          if (error) reject({ error, response })
      }
    )
  })
}

const createBlobContainer = (context, blobContainerName, blobService) => {
  context.log('Creating storage container if one does not exist...')

  return new Promise((resolve, reject) => {
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

const uploadBlob = async (context, schema) => {
  context.log('Uploading the generated schema as a blob...')

  const blobService = azure.createBlobService()
  const blobContainerName = process.env.SCHEMA_STORAGE_CONTAINER_NAME

  await createBlobContainer(context, blobContainerName, blobService)
  await createBlob(context, blobContainerName, schema, blobService)
}

module.exports = {
  uploadBlob,
  createBlobContainer,
  createBlob
}
