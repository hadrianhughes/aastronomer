# AAStronomer 🔭

AAStronomer is a RESTful API for finding celestial objects visible from your location.

The app logic is written in Python and the app runs in AWS via CDK.

Hosted at: [planets.hadrianhughes.com](https://planets.hadrianhughes.com)

## Endpoints

There are currently four API endpoints available:

| Endpoint     | Description                                                                                            |
|--------------|--------------------------------------------------------------------------------------------------------|
| /visible     | Attempts to find the ID for a location from lat/long or postcode and returns a list of visible objects |
| /visible/:id | Returns a list of visible objects from :id location                                                    |
| /id          | Attempts to find the ID for a location from lat/long or postcode and returns that ID                   |
| /id/:id      | Takes an ID and returns that ID if it is valid. This is effectively a noop without the /id endpoint    |

Full Swagger spec for endpoints at the URL above.


## CDK Structure

The CDK stack structure for the app is as follows:

The **PlanetsStack** is responsible for most of the infrastructure, including:
  - API Gateway
  - API Lambda Handlers
  - Lambda Layers
  - S3 Buckets (currently just for Swagger)
  - CloudFront

There is another stack called **EdgeStack**. This is responsible for provisioning resources which are exclusive to us-east-1. This includes:
  - Lambda@Edge Functions
  - ACM Certificates

Rather than having to manually keep track of ARNs for cross-region resources, the ARNs of resources created by **EdgeStack** are saved to SSM Parameter Store, and then fetched by the **PlanetsStack** via the **EdgeHandler** class (using Custom Resources).


## Lambda Layers

Logic that is shared across multiple API handlers is abstracted into Lambda Layers. This allows other Lambdas to import the shared code as if it were a bundled library.

### Using Lambda Layers Locally

When running in the cloud, Lambda Layers can be imported into Python files just like modules installed via pip. This doesn't work locally which poses a problem for unit testing.

To resolve this, the modules in `cdk/lambda/layers` can be symlinked into your virtualenv directory with the rest of the pip installed packages.
