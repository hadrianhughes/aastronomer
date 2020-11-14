# planets-api

A REST API for querying currently visible planets, running on AWS.


## Using Lambda Layers Locally

When running in the cloud, Lambda Layers can be imported into Python files just like modules installed via pip. This doesn't work locally which poses a problem for unit testing.

To resolve this, the modules in `cdk/lambda/layers` can be symlinked into your virtualenv directory with the rest of the pip installed packages.
