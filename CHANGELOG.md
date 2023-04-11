# Extrahorizon CLI changelog

### v1.0.4
* Security update

### v1.0.3
* Fix setting of execution permission
* Set credentials as environment variables as well, but only if they're not defined yet

### v1.0.2
* Fix JSON schema for transition where `configuration` was marked as mandatory

### v1.0.1
* Fixed broken environment variables

### v1.0.0

* Add support for setting execution permission when syncing a task. Options are `permissionRequired`, `allUsers` or `public`.
* Remove implicit settings from task config syncing: some settings, such as `memoryLimit` or `timeLimit`, were given default values when not specified in task config. This can give undesired results, for example overriding custom values in the backend. __This change causes the backend defaults to be used if not specified in the task-config.json. Please verify that this is the desired behaviour__
* Add support for setting `retryPolicy` in task-config.json.
* Example task-config.json can be found [here](examples/task-config.example.json).