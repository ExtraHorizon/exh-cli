# Dispatchers

In Extra Horizon, you can create Dispatchers which trigger Actions based on incoming events. You can manage these Dispatchers and their Actions using the Extra Horizon CLI by creating and consuming a JSON file containing all your Dispatchers. This JSON file can then be easily managed through version control and the CLI will help you to synchronize the Dispatchers with Extra Horizon.

{% hint style="info" %}
For information regarding Dispatchers and the Dispatcher Service please refer to the [Dispatcher Service documentation](https://docs.extrahorizon.com/extrahorizon/services/automation/dispatchers-service).
{% endhint %}

## Create a new dispatcher <a href="#schema-initialization" id="schema-initialization"></a>

To create a new dispatcher, you can use the `init` command. This command will generate a minimal dispatcher for you to start out with.

This example will create a new dispatcher at the top of `dispatchers.json` file. If the `dispatchers.json` file does not exist, it will be created.

```
exh dispatchers init <dispatcher-name>
```

After editing the dispatcher file to your liking, you can use the `exh dispatchers sync` command to upload your new dispatcher to your Extra Horizon cloud.

#### **Arguments**

`--file`

Optional. Path to the JSON file containing the dispatchers. Defaults to `./dispatchers.json`. If the specified file does not exist, it is created.

## Synchronizing Dispatchers

This command provides the functionality to read a locally declared Dispatchers file and synchronize the contents with existing Dispatchers.

```
exh dispatchers sync
```

A tag with value `EXH_CLI_MANAGED` will be appended to Dispatchers created with the CLI.

The CLI will only consider Dispatchers with the `EXH_CLI_MANAGED` tag for updates or deletions.

#### Arguments

`--file`

Optional. Path to the JSON file containing the dispatchers. Defaults to `./dispatchers.json`.

`--clean`

This optional argument will delete all Dispatchers with the `EXH_CLI_MANAGED` tag that are not present in the local Dispatchers file.

{% hint style="warning" %}
The `--clean` argument performs a destructive operation that can not be reverted.
{% endhint %}

#### Example

{% tabs %}
{% tab title="CLI" %}
```bash
exh dispatchers sync --clean
```
{% endtab %}
{% endtabs %}

#### File format

Dispatchers must be provided in a `.json` file as defined in the [arguments](dispatchers.md#arguments) section. This file must contain an array of Dispatcher objects as shown in the [example](dispatchers.md#example-1) below.

For detailed information regarding the structure of a Dispatcher, please refer to the section [Create your first Dispatcher](https://docs.extrahorizon.com/extrahorizon/services/automation/dispatchers-service#create-your-first-dispatcher).

#### Example

{% code title="dispatchers.json" %}
```json
{
  "dispatchers": [
    {
      "eventType": "my-event-type",
      "name": "my-unique-dispatcher-name",
      "description": "A Dispatcher that handles my-event-type",
      "actions":[
        {
          "type": "task",
          "name": "my-task-action",
          "description": "Create a task that handles my-event-type",
          "functionName": "my-function-name",
          "data": {
            "customStringField": "myStringHere",
            "customNumberField": 42
          },
          "startTimestamp": "2024-01-01T00:00:00.000Z",
          "tags":["tag1", "tag2"]
        },
        {
          "type": "mail",
          "name": "my-mail-action",
          "description": "Send an email about my-event-type",
          "recipients": {
            "to": ["john.doe@example.com"],
            "cc": ["jane.doe@example.com"],
            "bcc": ["bcc@example.com"]
          },
          "templateName": "myTemplateName"
        }
      ],
      "tags": ["tag1", "tag2"]
    }
  ],
  "$schema": "https://swagger.extrahorizon.com/cli/1.13.0/config-json-schemas/Dispatchers.json"
}
```
{% endcode %}
