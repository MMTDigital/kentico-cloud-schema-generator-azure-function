const fs = require('fs')
const { promisify } = require('util')
const { DeliveryClient } = require('kentico-cloud-delivery')
const { SchemaGenerator } = require('kentico-cloud-graphql-schema-generator/_commonjs/schema-generator')

const generateSchema = (context) => {
  context.log('Generating schema from Kentico Cloud instance...')

  const deliveryClient = new DeliveryClient({
    enableSecuredMode: false,
    projectId: process.env.KENTICO_CLOUD_PROJECT_ID
  })

  const writeFile = promisify(fs.writeFile)
  const generator = new SchemaGenerator(deliveryClient)

  return generator.getSchema()
    .catch(error => {
      context.log.error('Error while writing schema to file', error)
    })
}

module.exports = generateSchema
