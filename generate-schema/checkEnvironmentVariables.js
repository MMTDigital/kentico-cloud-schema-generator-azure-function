const environmentVariables = require('checkenv')

const checkEnvironmentVariables = (context) => {
  context.log('Ensuring the necessary environment variables are present...')

  try {
    environmentVariables.check(false)
    return true
  } catch (error) {
    context.log.error(error)

    context.res = {
      status: 500,
      body: 'Environment variables missing. Please refer to the README and the env.json to ensure you have all the correct environment variables in place. More details will br provided in server the console.'
    }

    return false
  }
}

module.exports = checkEnvironmentVariables
