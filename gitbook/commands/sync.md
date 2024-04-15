---
description: Organising your Extra Horizon configuration
---

# Sync

The `exh` client has a global sync command for synchronizing your Schema, Tasks, Templates and Dispatchers using a single command.

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

| Command                                                      | Path               |
| ------------------------------------------------------------ | ------------------ |
| [Schemas Sync](commands.md#schema-sync)                      | ./schemas          |
| [Templates Sync](templates.md#synchronizing-template)        | ./templates        |
| [Tasks Sync](tasks.md#synchronize-a-task)                    | ./tasks            |
| [Dispatchers Sync](dispatchers.md#synchronizing-dispatchers) | ./dispatchers.json |

### Custom configuration

In case this is not the directory layout you prefer, these locations can be customized by creating a `repo-config.json` in the top directory. Example:

```
{
  "schemas": [
    "/path/to/my-schemas",
    "/another/path/to/schemas"
  ],
  "templates": [
    "./templates"
  ],
  "tasks": [
    "/path/to/tasks",
    "/another/path/to/tasks"
  ]
}
```

{% hint style="info" %}
Dispatchers are expected to always exist within a root file named `dispatchers.json`
{% endhint %}
