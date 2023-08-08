# Extrahorizon CLI changelog

### v1.1.0
* Added single file sync command for schemas with `exh schema sync --file <path>`
* Added a dry run argument for schema sync `exh schemas sync --dry`. This will report the properties to be added, removed and updated in the terminal, without persisting schema changes.
* Added verification and validation for statuses that are defined, but not present in transitions.
* Added validation to ensure that properties in a creation transition exist in the schema properties.
* Added verification and validation of transition conditions.
* Added terminal notifications for if a newer release of the CLI available.

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
