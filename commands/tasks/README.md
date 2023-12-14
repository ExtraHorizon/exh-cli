# Tasks

{% hint style="info" %}
For more information on tasks and the task service, please read through the [task service documentation](https://docs.extrahorizon.com/extrahorizon/for-developers/automation/task-service)
{% endhint %}

### Create a new task

The Extra Horizon CLI provides a great way for you to bootstrap your new task. Doing `exh tasks create-repo your-task-name` will create a fresh folder for you on your local machine called `your-task-name` & set the task name. It contains a sample task and will make sure you hit the ground running. The folder can also be initialised as a git repository by using the `--git` flag.

Check out the README.md file of your freshly created repository to see how to run, build & test your new task.

If you have your own template repository you want to start from, you can even specify the repository using the `repo` option. For example:

```
exh tasks create-repo my-task-name --repo=https://github.com/mycompany/my-template
```

{% hint style="info" %}
If you're using Github, you can also use the template to directly create a repository on Github itself. Go to [https://github.com/ExtraHorizon/template-task](https://github.com/ExtraHorizon/template-task), click 'Use this template' and can you create the repository directly on Github.
{% endhint %}

#### Arguments

`--repo`

&#x20;Specify the repository template to clone. By default, we utilize the task template from Extra Horizon.&#x20;

`--git`

&#x20;Initialize the cloned folder as a new Git repository.

### List tasks

This command lists all tasks currently configured in the task service.

```
exh tasks list
```

### Synchronize a task

When you have implemented your new task, you need to synchronize this task so it can run in Extra Horizon cloud. There is a single `sync` command to do this efficiently, however there is some extra configuration that you need to take care of.

The backend needs some extra information in order to properly run your task, such as:

* Name & description of your task
* Entrypoint of the task
* Memory requirements
* Execution time requirements
* Environment variables

There are 2 ways you can pass this information to `exh`. Either specify all the parameters to the `sync` command, for example:

```
exh tasks sync --name test-filip --description "my test" --code ../sample-repo/tasks/bior-delete-user-task/build --runtime nodejs14.x --entryPoint build/index --timeLimit 60 --memoryLimit 128 --env VAR1=value1 --env VAR3=value2
```

but this can be very tedious to use. Instead you can create a `task-config.json` configuration which resides in your code folder. This has the added advantage that any changes to the task configuration can be tracked together with your code. A sample `task-config.json` looks like:

```
{
  "name": "my-task",
  "description": "My sample task",
  "path": "build",
  "entryPoint": "build/index",
  "runtime": "nodejs14.x",
  "timeLimit": 60,
  "memoryLimit": 128,
  "environment": {
    "setting1": "value1",
    "secret": "$MYSECRET"
  }
}
```

and then you can just point `exh` to the configuration file:

```
exh tasks sync --path /my/path/task-config.json
```

which will synchronize your task with the requested configuration.

{% hint style="info" %}
If you need to pass secrets to the task configuration, but do not want to commit this secret in a configuration file, you can use variables such as`$MYSECRET` in the above example. When parsing the configuration file, `exh` will replace this value with an environment variable of the same name. This way, CI systems are able to provision secrets while safeguarding their confidentiality.
{% endhint %}

#### Synchronizing multiple tasks

If you have multiple tasks which you want to synchronize all at the same time, you can pass a directory path to the `path` parameter. If `exh` detects it's a directory, it will scan each subdirectory for a `task-config.json` file and 'execute' it. The only requirement is that all your tasks need to have the same parent directory.

#### Overriding configuration parameters

When you're synchronizing a single task using a `task-config.json` file, any additional parameters passed via command-line will override the parameter specified in the file. This way you can (temporarily) override a single parameter for a task.&#x20;

#### Arguments

`--path`              &#x20;

Specify the path to the configuration JSON file containing task parameters. If a directory is provided instead, exh-cli will search for a task-config.json file within all subdirectories and synchronize them. If this option is not used, each parameter (name, code, entryPoint, runtime, etc.) must be supplied separately.                                 &#x20;

&#x20; `--name`

Specify the name of the task.

&#x20; `--code`           &#x20;

Provide the path to a directory containing the built task. exh-cli will compress the directory and upload it.

&#x20; `--entryPoint`       &#x20;

Specify the code function that should be invoked. For example, use 'index.handler' for Node.js.

&#x20; `--runtime`             &#x20;

Specify the [runtime](https://docs.extrahorizon.com/extrahorizon/services/automation/task-service/functions#runtime) to use for the task.

&#x20; `--description`        &#x20;

Add a description for this task.

&#x20; `--timeLimit`           &#x20;

Specify the execution [time limit ](https://docs.extrahorizon.com/extrahorizon/services/automation/task-service/functions#timelimit)for this task (in seconds).

&#x20; `--memoryLimit`        &#x20;

Specify the allocated [memory](https://docs.extrahorizon.com/extrahorizon/services/automation/task-service/functions#memorylimit) for this task (in MB).

&#x20; `--env`                 &#x20;

Set environment variables for this task. This option can be used multiple times for multiple environment variables.

&#x20; `--executionPermission`

Specify the [permission mode](https://docs.extrahorizon.com/extrahorizon/services/automation/task-service/functions#executionoptions-properties) of the task.

#### Example

Take a look at our [Hello-world example](hello-world-task.md) for a nodeJS function.

### Delete a task

This command deletes a task currently configured in the task service.

```
exh tasks delete --name my-task-name
```

#### Arguments                        &#x20;

&#x20; `--name`

Provide the name of the task to be deleted
