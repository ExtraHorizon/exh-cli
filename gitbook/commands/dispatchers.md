# Dispatchers

In Extra Horizon, you can create Dispatchers which trigger Actions based on incoming events. You can manage these Dispatchers and their Actions using the Extra Horizon CLI by creating and consuming a JSON file containing all your Dispatchers. This JSON file can then be easily managed through version control and the CLI will help you to synchronize the Dispatchers with Extra Horizon.

{% hint style="info" %}
For information regarding Dispatchers and the Dispatcher Service please refer to the [Dispatcher Service documentation](https://docs.extrahorizon.com/extrahorizon/services/automation/dispatchers-service).
{% endhint %}

## Synchronizing Dispatchers

### Command

```
exh dispatchers sync
```

This command provides the functionality to read a locally declared Dispatchers file and synchronize the contents with existing Dispatchers.

A tag with value `EXH_CLI_MANAGED` will be appended to Dispatchers created with the CLI.

The CLI will only consider Dispatchers with the `EXH_CLI_MANAGED` tag for updates or deletions.

#### Arguments

`--file`

This required argument must point to the JSON file containing the array of Dispatchers to be synchronized.

`--clean`

This optional argument will delete all Dispatchers with the `EXH_CLI_MANAGED` tag that are not present in the local Dispatchers file.

{% hint style="warning" %}
The `--clean` argument performs a destructive operation that can not be reverted.
{% endhint %}

### Example

{% tabs %}
{% tab title="CLI" %}
```bash
exh dispatchers sync --file=./path/to/dispatchers.json --clean
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="JSON" %}
```json
[
  {
    "eventType": "my-event-type",
    "name": "my-unique-dispatcher-name",
    "description": "A Dispatcher that handles my-event-type",
    "actions":[
      {
        "type": "task",
        "name": "my-unique-action-name",
        "description": "A Task Action that handles my-event-type",
        "functionName": "my-function-name",
        "data": {
          "customStringField": "myStringHere",
          "customNumberField": 42
        },
        "startTimestamp": "2024-01-01T00:00:00.000Z",
        "tags":[
          "tag1",
          "tag2"
        ]
      }
    ],
    "tags": [
      "tag1",
      "tag2"
    ]
  }
]
```
{% endtab %}
{% endtabs %}
