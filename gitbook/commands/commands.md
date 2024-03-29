# Data

## Schemas

{% hint style="info" %}
This section assumes some basic familiarity with the data service and the concept of schemas. To get more information on those topics, please read through [Data service](https://docs.extrahorizon.com/extrahorizon/for-developers/manage-data/data-service) in the ExtraHorizon documentation.
{% endhint %}

When creating a data schema, you'll typically make a JSON file containing a specification of how your data should look like and how it should behave in transitions. This JSON file can then be easily managed through version control. The exh-cli will help you to verify and synchronise the schema with the ExtraHorizon cloud. An example schema JSON file looks as follows:

```
{
  "name": "MyFirstSchema",
  "description": "Example of a schema",
  "createMode": "permissionRequired",
  "readMode": "allUsers",
  "updateMode": "default",
  "deleteMode": "permissionRequired",
  "statuses": {
    "created": {},
    "active": {},
    "done": {},
  },
  "creationTransition": {
    "type": "manual",
    "toStatus": "created",
    "conditions": [
      {
         ...
      }
    ]
  },
  "transitions": [
    {
      "name": "activate",
      "type": "automatic",
      "fromStatuses": [
        "created"
      ],
      "toStatus": "active"
    },
    ...
  ],
  "properties": {
    "firstproperty": {
      "type": "string",
    },
    "secondproperty": {
      "type": "number"
    }
  }
}
```

### Schema list

List the names of all the schemas which are currently configured in the cloud

```
exh data schemas list
```

### Schema verify

A schema can be a fairly complicated json file. In the course of development it is nice to have a way to check whether you've made some obvious (or even non-obvious) mistakes. The exh-cli contains a command to do exactly that. It performs some syntactical & logical checks and informs you of any errors that might lurk within the cobwebs of your schema.

You can either check for a single file

```
exh data schemas verify --file=<path-to-your-file>
```

Or check an entire directory of schemas at once

```
exh data schemas verify --dir=<directory-path> 
```

#### Arguments

`--file`

This argument is used to specify the path to the JSON file that contains the schema to be verified.

`--dir`&#x20;

This argument is used to specify the directory that contains all the schema files to be verified.

### Schema sync

When you've created your schemas & verified that they are correct, you can upload them to the ExtraHorizon cloud & start working with them! This upload can be done using the `sync` command.&#x20;

```
exh data schemas sync --dir=<pathToSchemaDir> 
```

This will upload the entire directory at once. The cli will:

* Check whether the schema already exists and create a new one if it doesn't&#x20;
* Look for differences between the schema in the cloud and your local schema and make sure that these differences are synchronized.

Therefore, if you make any subsequent changes to the schemas, you can just run the sync again and the cli will make sure that the changes are properly synced.

#### Arguments

`--file`

This argument is used to specify the path to the JSON file that contains the schema to be synchronized.

`--dir`&#x20;

This argument is used to specify the directory that contains all the schema files to be synchronized.

`--dry`

When this argument is set, a dry-run will be performed. During a dry-run, only output will be printed, but no changes will be applied to the back-end. This option is useful for previewing changes without affecting the actual configuration.

`--ignoreVerificationErrors`

Allows synchronization to proceed even if there are validation errors. Use this option if you want to continue with the synchronization process despite errors in the provided schema. Use cautiously, as it may lead to synchronization of a potentially flawed configuration.

### Schema delete

The sync process as described above, will never delete schemas entirely. So if you delete a schema from your schema directory, the cli will leave that schema untouched in the cloud to prevent accidental deletion. However, there is a separate command to delete schema should you need to do so.

```
exh data schemas delete --id=<schema-id>
```

You'll need the ID of the schema you want to delete. This is _not_ the name of the schema. You can retrieve ID of a schema from the [schema list](commands.md#schema-list) command.

#### Arguments

`--id`

This argument is used to specify the id of the schema to be deleted.
