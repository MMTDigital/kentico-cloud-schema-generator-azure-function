const checkEnvironmentVariables = require('./checkEnvironmentVariables')
const generateSchema = require('./generateSchema')
const { uploadBlob } = require('./storage')

module.exports = async (context, request) => {
  context.log('Kentico Cloud schema generator request received...')

  try {
    const envVarsAreValid = await checkEnvironmentVariables(context)
    if (!envVarsAreValid) return

    const schema = await generateSchema(context)
    await uploadBlob(context, schema)
  } catch (error) {
    context.log.error(error)
  }
}
