# Extra Horizon CLI changelog

### [Unreleased]
* Removed the update notifier. The version of the package we used had security vulnerabilities and we're unable to migrate to the latest version right now. We'll look into this again in the future.
* Added the `exh whoami` command, showing the currently logged in user

### v1.5.1
* Now also publishing to the NPM registry, no longer needing to authenticate with GitHub Packages to install the CLI

### v1.5.0
* Updated the supported runtimes for task functions
* `exh data schemas verify` and `exh tasks create-repo` no longer require you to be authenticated
* `@extra-horizon/javascript-sdk` has been updated to `8.2.0`
* Unused dependencies have been removed

### v1.4.0
* Added a validation check for `id` properties in objects within arrays in data schemas, this will now be reported as an error if present.
* Added validation for duplicate transition names in data schemas, this will now be reported as an error if present.
* Changed the strictness of validation for properties of input conditions. Modifiers such as `enum`, `minLength`, `maxLength`, etc... will no longer produce an error if not present in the condition property.

### v1.3.0
* Added a command to synchronize Dispatchers `exh dispatchers sync --file=<path>` the file argument must point to a JSON file containing an array of Dispatchers to be synchronized.
* Added Dispatchers to the general `exh sync` command, this will synchronize all Dispatchers within a file named `dispatchers.json` in the working directory or within the provided `path` argument directory.
* Added an argument `exh sync --dispatchers` to synchronize only Dispatchers.
* Added arguments to clean up Extra Horizon Dispatchers during synchronization `exh dispatchers sync --clean` and `exh sync --cleanDispatchers`. These arguments will remove all Dispatchers created by the CLI that are no longer present in the local Dispatchers file.

### v1.2.0
* Added a sync argument `exh sync ... --ignoreSchemaVerificationErrors` to bypass schema verification errors, this allows schemas to be synced even if errors are reported
* Added a schema sync argument `exh data schemas sync ... --ignoreVerificationErrors` to bypass schema verification errors, this allows schemas to be synced even if errors are reported
* Fixed an issue synchronizing statuses with an existing schema, excess properties should now be correctly removed from statuses
* Updated the supported runtimes for tasks
* The `--help` information now correctly displays `exh` rather than `index.js` as the command.

### v1.1.0
* Added single file sync command for schemas with `exh data schemas sync --file=<path>`
* Added a dry run argument for schema sync `exh data schemas sync --file=<path> --dry`. This will report the properties to be added, removed and updated in the terminal, without persisting schema changes.
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
