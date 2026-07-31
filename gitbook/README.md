# Getting started

{% hint style="warning" %}
The ExtraHorizon CLI is currently in **Beta**
{% endhint %}

To get started with the ExtraHorizon CLI (exh-cli) you'll need to install it and get credentials which will allow you to access the backend.

* [Installation](readme/installation.md)
* [Login](readme/login.md)

## Help

You can always use the `--help` option in order to get help on a certain command. For example

```
> exh --help
exh <command>

Commands:
  exh completion               Install shell completion for bash & zsh
  exh data <command>           Manage data
  exh dispatchers <command>    Manage Dispatchers within Extra Horizon
  exh localizations <command>  Manage localizations
  exh login                    Retrieve credentials from ExH
  exh sync                     Sync your ExH configuration to the cloud
                               environment
  exh tasks <command>          Manage tasks
  exh templates <command>      Manage templates
  exh whoami                   Shows the currently logged in user

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

and then you can dig down further asking help for a specific command such as

```
> exh data schemas --help
exh data schemas <command>

Manage data schemas

Commands:
  exh data schemas delete  Delete a schema
  exh data schemas list    List all schemas
  exh data schemas sync    Sync all schemas in a directory with the ExH cloud
  exh data schemas verify  Syntactically verify a local schema

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]

Visit https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
```
