---
description: Organising your Extra Horizon configuration
---

# Sync

The `exh` client has a global sync command for synchronizing your Schemas, Tasks, Templates, Localizations, Dispatchers and settings using a single command.

```
exh sync
```

will sync your current directory. While

```
exh sync --path /your/path/here
```

will allow you to specify exactly which directory you want to sync, by default the CLI will try to sync the Extra Horizon configuration using a [default file structure](sync.md#default-configuration).

### Default configuration

The Extra Horizon CLI by default will execute the relevant commands for these subfolders:

| Command                                                      | Path                      |
| ------------------------------------------------------------ | ------------------------- |
| [Schemas Sync](commands.md#schema-sync)                      | `./schemas`               |
| [Tasks Sync](tasks.md#synchronize-a-task)                    | `./tasks`                 |
| [Templates Sync](templates.md#synchronizing-template)        | `./templates`             |
| [Localizations Sync](localizations.md)                       | `./localizations`         |
| [Dispatchers Sync](dispatchers.md#synchronizing-dispatchers) | `./dispatchers.json`      |
| [Settings Sync](settings.md#synchronize-settings)            | `./service-settings.json` |

### Custom configuration

In case this is not the directory layout you prefer, these locations can be customized by creating a `repo-config.json` in the top directory. Example:

```
{
  "schemas": [
    "./path/to/my-schemas",
    "./another/path/to/schemas"
  ],
  "tasks": [
    "./path/to/tasks",
    "./another/path/to/tasks"
  ],
  "templates": [
    "./path/to/templates",
    "./another/path/to/templates"
  ],
  "localizations": [
    "./path/to/localizations",
    "./another/path/to/localizations"
  ]
}
```

{% hint style="info" %}
Dispatchers are expected to always exist within a root file named `dispatchers.json`&#x20;

Service settings are expected to always exist within a root file name `service-settings.json`
{% endhint %}
