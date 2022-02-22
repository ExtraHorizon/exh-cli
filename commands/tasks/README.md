# Tasks

{% hint style="info" %}
For more information on tasks and the task service, please read through the [task service documentation](https://docs.extrahorizon.com/extrahorizon/for-developers/automation/task-service)
{% endhint %}

### Create a new task

The Extra Horizon CLI provides a great way for you to bootstrap your new task. Doing `exh tasks create-repo your-task-name` will create a fresh repository for you on your local machine called `your-task-name`, initialise git & set the task name. It contains a sample task and will make sure you hit the ground running.

Check out the README.md file of your freshly created repository to see how to run, build & test your new task.

If you have your own template repository you want to start from, you can even specify the repository using the `repo` option. For example:

```
exh tasks create-repo my-task-name --repo=https://github.com/mycompany/my-template
```

{% hint style="info" %}
If you're using Github, you can also use the template to directly create a repository on Github itself. Go to [https://github.com/ExtraHorizon/template-task](https://github.com/ExtraHorizon/template-task), click 'Use this template' and can you create the repository directly on Github.
{% endhint %}

### List tasks

```
exh tasks list
```

This command will list all tasks currently configured in the task service.

### Upload a new task

You can create a new task by uploading your packaged code to the task service.

```
exh tasks create <options>
```

Take a look at our [Hello-world example](hello-world-task.md) for a nodeJS function.

### Update a task

```
exh tasks update <options>
```

### Delete a task

```
exh tasks delete <options>
```
