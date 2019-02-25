# Kentico Cloud Schema Generator — Azure Function

This repo provides an Azure Function setup that will generate a Kentico Cloud content model GraphQL schema and upload it to a Azure Storage as a blob.

Generally-speaking, this would be triggered via a webhook, sent out from Kentico Cloud when content models change are updated. However, it can also be triggered manually by hitting the Azure Function URL endpoint.

# Getting Started

1) Fork this repo
2) Install latest stable version of Node and Yarn
3) Create a file at the root of the repo called `local.settings.json` and place this in it:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "AZURE_STORAGE_CONNECTION_STRING": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KENTICO_CLOUD_PROJECT_ID": "",
    "KENTICO_CLOUD_SCHEMA_OUTPUT": "./kentico-cloud-schema.graphql"
  }
}

```
**Do not commit this file to the repo**

4) Install dependencies: `yarn`
5) Populate the Kentico Cloud Project ID from Kentico Cloud
6) Run through the deployment process outlined below. Note, this may have already been done by your team, so check first
7) Populate the `AzureWebJobsStorage` and `AZURE_STORAGE_CONNECTION_STRING` with the created Azure Storage connection string
8) Finally, you can run and develop locally with `yarn start`

The tool set to run and develop Azure Functions is provided by Azure Functions Core Tools. This has been installed as a dev dependency. To read more about these tools, check out the documentation: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local

Avoid the temptation to install these tools globally on your system. Use the dev dependency and use npm scripts to run tasks. This keeps things running consistently across all machines.

# Deployment

Currently, this is a horrible manual process. It uses the Azure "Deployment Center" to set up:

1) Sign in to the Azure Portal of choice: https://portal.azure.com
2) Create a new Azure Function by clicking **Create a resource** and searching for "Function App". Set it up with the following values:
    - **App name**: `{project}-kentico-cloud-schema-generator-{environment}`. _For example: `ciot-kentico-cloud-schema-generator-dev`_
    - **Resource Group**: Select a resource group for the project (hopefully one should already exist)
    - **OS**: Windows
    - **Hosting Plan**: Consumption Plan
    - **Location**: Central US
    - **Runtime Stack**: JavaScript
    - **Storage**: Create new (keep the ugly auto-generated name)
    - **Application Insights**: Enabled
3) Once it's setup and deployed (this can take a few minutes) Click **Function Apps**
4) Click the new function app and select the **Platform features** tab
5) Click **Deployment Center**
6) Select the repo provider that holds this forked repo
7) Run through the next steps for CI / CD. This is slightly different per-provider
8) If you are setting up a development environment, use the `dev` branch of the repo, otherwise use the `master` branch. How your branching strategy and deployment of the function works moving forward is up to you. There is a high chance that this function will never need to change at all.

### Notes and thoughts:

I utterly hate this deployment process. However, I tried the `serverless` framework and the Azure tooling is no where near as developed as the AWS stuff. You can't even invoke locally, which is a deal-breaker.

Perhaps this could be rolled up into an npm module, negating the need to fork the whole repo and maintain multiple copies of this. The forked repo could just be a _very_ light wrapper that uses the npm module.

Other CI / CD methods are available, such as using the Azure CLI: https://docs.microsoft.com/en-us/azure/azure-functions/functions-continuous-deployment

Here is an article outlining how to deploy from Azure DevOps. This could go out of date very fast though! https://guyharwood.co.uk/2018/07/26/deploy-node-js-azure-functions-from-vsts

More useful articles, as this is quite new tech: 
- https://michaelheap.com/git-and-nodejs-on-azure-functions
