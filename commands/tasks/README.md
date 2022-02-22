# Tasks

{% hint style="info" %}
For more information on tasks and the task service, please read through the [task service documentation](https://docs.extrahorizon.com/extrahorizon/for-developers/automation/task-service)
{% endhint %}

### Create new task

The Extra Horizon CLI provides a great way for you to bootstrap your new task. Doing `exh tasks create-repo your-task-name` will create a fresh repository for you on your local machine called `your-task-name`, initialise git & set the task name. It contains a sample task and will make sure you hit the ground running.

If you have your own template repository you want to start from, you can even specify the repository using the `repo` option. For example:

```
exh tasks create-repo my-task-name --repo=https://github.com/mycompany/my-template
```

### List tasks

```
exh tasks list
```

This command will list all tasks currently configured in the task service.

### Create a new function

You can create a new function by uploading your packaged code to the task service.

```
exh tasks create <options>
```

Take a look at our [Hello-world example](hello-world-task.md) for a nodeJS function.

### Update a function

```
exh tasks update <options>
```

### Delete function

```
exh tasks delete <options>
```
