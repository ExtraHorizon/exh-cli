---
description: Organising your Extra Horizon configuration
---

# Repository configuration

The `exh` client has a global sync command for synchronizing your Schema, Tasks, Templates and Dispatchers using a single command.

```
exh sync
```

will sync your current directory. While

```
exh sync --path /your/path/here
```

will allow you to specify exactly which directory you want to sync

By default, `exh` will try to sync all schemas in a `schemas` subdirectory, templates in a `templates` subdirectory, tasks in a `tasks` subdirectory and Dispatchers in a `dispatchers.json` file.

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
