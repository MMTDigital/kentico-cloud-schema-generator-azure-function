const fs = require('fs')
const { exec } = require('child_process')
const { promisify } = require('util')
const asyncExec = promisify(exec)
const azure = require('azure-storage')
const { SchemaGenerator } = require('kentico-cloud-graphql-schema-generator/_commonjs/schema-generator')
const { DeliveryClient } = require('kentico-cloud-delivery')

const runHandler = (request, context, handler) => {
  return new Promise((resolve, reject) => {
    const callback = (error, body) => (error ? reject(error) : resolve(body))
    handler(context, request, callback)
  })
}

const checkEnvironmentVariables = (context) => {
  context.log('Ensuring the necessary environment variables are present')

  const envVars = [
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    process.env.KENTICO_CLOUD_PROJECT_ID,
    process.env.GENERATED_SCHEMA_OUTPUT,
    process.env.SCHEMA_STORAGE_CONTAINER_NAME,
    process.env.SCHEMA_STORAGE_BLOB_NAME
  ]

  const isMissingEnvVar = envVars.some(value => !value)

  if (isMissingEnvVar) {
    context.done(null, {
      status: 500,
      body: 'Environment variables missing. Please refer to the README to ensure you have all the correct environment variables in place'
    })
  }
}

const blobService = azure.createBlobService()

const deliveryClient = new DeliveryClient({
  enableSecuredMode: false,
  projectId: process.env.KENTICO_CLOUD_PROJECT_ID
})

const writeFile = promisify(fs.writeFile)
const generator = new SchemaGenerator(deliveryClient)

const generateSchema = () => (
  generator.getSchema()
    .then(result => writeFile(process.env.GENERATED_SCHEMA_OUTPUT, result))
    .catch(error => {
      console.error('Error while writing schema to file', error)
    })
)

const createBlob = (context, blobContainerName, blobFileName) => {
  return new Promise((resolve, reject) => {
    context.log('Creating blob...')
    blobService.createBlockBlobFromLocalFile(
        blobContainerName,
        blobFileName,
        process.env.GENERATED_SCHEMA_OUTPUT,
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
  const blobContainerName = process.env.SCHEMA_STORAGE_CONTAINER_NAME
  const blobFileName = process.env.SCHEMA_STORAGE_BLOB_NAME
  await createBlobContainer(context, blobContainerName)
  await createBlob(context, blobContainerName, blobFileName)
}

module.exports = async (context, request) => {
  context.log('Kentico Cloud Schema Generator Request Received')

  try {
    await checkEnvironmentVariables(context)
    await generateSchema()
    await uploadBlob(context)
  } catch (error) {
    context.log.error(error)
  }
}
