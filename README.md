# Getting started

To get started with the ExtraHorizon CLI (exh-cli) you'll need to install it and get credentials which will allow you to access the backend.

* [Installation](installation.md)
* [configure credentials](https://docs.extrahorizon.com/cli/#configuring-your-credentials)
* [command overview](./#general)

### Configuring your credentials

Next we will configure the credentials which exh-cli needs  to access the ExtraHorizon cloud.  You should have an account on the ExtraHorizon cloud. If not, please contact your representative.

The account credentials you've received  consist of `email` , `password`, `consumerKey`and `consumerSecret`. Together with the `host`, which is the https address of your ExtraHorizon cloud, we will supply these credentials to exh-cli. It will use this to request a token from the ExtraHorizon cloud and this token will subsequently be used to communicate with the ExtraHorizon cloud.

```
exh login --host=https://env.customer.extrahorizon.io --email=youremail 
    --password=yourpassword --consumerKey=yourconsumerkey 
    --consumerSecret=yourconsumersecret
```

This command will create credentials in your home directory in `.exh/credentials`.&#x20;

{% code title="Example ~/.exh/credentials" %}
```
API_HOST=env.customer.extrahorizon.io
API_OAUTH_CONSUMER_KEY=****************************
API_OAUTH_CONSUMER_SECRET=****************************
API_OAUTH_TOKEN=****************************
API_OAUTH_TOKEN_SECRET=***************************
```
{% endcode %}

That's it! You should now be ready to use exh-cli

### Command Overview

* ****[**Data**](commands/commands.md) **->**commands related to data service management
* ****[**Tasks**](commands/tasks/) **->**command related to task service management

You can always use the `--help` option in order to get help on a certain command. For example

```
exh data schemas --help
```

will return

```
build data schemas <command>

Manage data schemas

Commands:
  build data schemas delete  Delete a schema
  build data schemas list    List all schemas
  build data schemas sync    Sync all schemas in a directory with the ExH cloud
  build data schemas verify  Syntactically verify a local schema

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]

Visit https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
```

and then you can dig down further asking help for a specific command such as

```
exh {service} {subcCommands...} --help

//an example
exh data schemas sync --help
```
