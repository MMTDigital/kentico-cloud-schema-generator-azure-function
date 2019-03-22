# Kentico Cloud Schema Generator — Azure Function

An Azure Function setup that will generate a Kentico Cloud content model GraphQL schema and upload it to Azure Storage as a blob.

Note: you likely will need this repo also – https://github.com/MMTDigital/kentico-cloud-graphql-server-azure-function

![Container Diagram](./container-diagram.png?raw=true "Container Diagram")

Generally-speaking, this would be triggered via a webhook, sent out from Kentico Cloud when content models change are updated. However, it can also be triggered manually by hitting the Azure Function URL endpoint.

# Getting Started

1) Fork this repo
2) Install latest stable version of Node and Yarn
3) Install dependencies: `yarn`
4) Run through the deployment process outlined below. Note, this may have already been done by your team, so check first
5) Create a file at the root of the repo called `local.settings.json` and place this in it:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "AZURE_STORAGE_CONNECTION_STRING": "",
    "FUNCTIONS_WORKER_RUNTIME": "",
    "KENTICO_CLOUD_PROJECT_ID": "",
    "KENTICO_CLOUD_SCHEMA_OUTPUT": ""
  }
}

```
**Do not commit this file to the repo**

6) Populate the environment values. Check the env.json for a description of each.

### Advanced Local Development

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

### Function App Storage

Once you have set up a Function App within Azure, a Storage resource will be automatically created for you. You can find it in the **Storage Accounts** section. The name should match the auto-generated name in step 2. You will need to grab the connection string for this storage:

- Click the storage name
- Go to **Access Keys**
- Copy the connection string in `key1`

**Note: this connection string is confidential. It should not be checked into a repo and ideally not shared insecurely**


## Further Notes and thoughts:

I utterly hate this deployment process. However, I tried the `serverless` framework and the Azure tooling is no where near as developed as the AWS stuff. You can't even invoke locally, which is a deal-breaker.

Perhaps this could be rolled up into an npm module, negating the need to fork the whole repo and maintain multiple copies of this. The forked repo could just be a _very_ light wrapper that uses the npm module.

Other CI / CD methods are available, such as using the Azure CLI: https://docs.microsoft.com/en-us/azure/azure-functions/functions-continuous-deployment

Here is an article outlining how to deploy from Azure DevOps. This could go out of date very fast though! https://guyharwood.co.uk/2018/07/26/deploy-node-js-azure-functions-from-vsts

More useful articles, as this is quite new tech: 
- https://michaelheap.com/git-and-nodejs-on-azure-functions
