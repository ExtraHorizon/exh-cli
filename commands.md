# Commands

## Data

### Schema sync

The schema sync command allows you to synchronize all data service schema's inside a directory.&#x20;

```
exh data schemas sync <pathToSchemaDir> 
```

Inside this directory you can define schema's and save them with a .json extension.&#x20;

{% code title="./schemas/schema.json" %}
```json
{
    "name": "myFirstSchema",
    "description": "description of my first schema",
    "statuses": {
        "status1": {},
        "status2": {}
    },
    "creationTransition": {
        "toStatus": "status2",
        "type": "manual"
    },
    "transitions":[
        {
            "name": "myTransition",
            "type": "manual",
            "fromStatuses": [
                "status1"
            ],
            "toStatus": "status2"
        }
    ],
    "properties": {
        "myNumberProperty": {
            "type": "number"
        },
        "myStringProperty": {
            "type": "string",
        }
    }
}
```
{% endcode %}

The cli will then check wether the schema already exists or create a new one and look for the differences and make sure these are synchronized.

### List tasks

```
exh tasks list
```

The list tasks command will list all functions currently configured in the&#x20;

### Create a new task

### Update a task

### Delete task
