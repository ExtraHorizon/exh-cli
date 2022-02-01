# Commands

### General

There are 2 major sections:

* ****[**Data**](commands.md) **->**commands related to data management
* ****[**Tasks**](tasks/) **->**command related to task management

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
exh data schemas sync --help
```
