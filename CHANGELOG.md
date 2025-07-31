# Extra Horizon CLI changelog

### v1.10.0

### v1.9.1
* Updated the ExH SDK to `8.7.1` to fix a security warning from `form-data`

### v1.9.0
* Introduced the `executionCredentials` field in the task configuration:
  * Specify the permissions your task needs
  * The CLI automatically creates a user, role, and credentials for your task
  * These credentials are injected as environment variables into the task automatically
  * If you want to migrate your existing tasks to use this feature, see the [migration guide](https://docs.extrahorizon.com/extrahorizon/migration-guides/execution-credentials-for-tasks).

### v1.8.2
* Updated the ExH SDK to `8.6.0` to fix a security warning from `axios`

### v1.8.1
* Updated the supported Task Service runtime options

### v1.8.0
* Schemas:
  * `createMode`, `readMode`, `updateMode` and `deleteMode` have been updated to accept multiple granular options, matching the revamped access mode changes in Data Service `1.4.0`
  * Transition Action `type: "task"` now supports the `priority` field
  * Transition `afterActions` now supports the `type: "task"` Action 
  * `exh data schemas sync` now doesn't try to sync `description` fields for Conditions and Actions in the `creationTransition`

### v1.7.0
* `exh data schemas sync` now allows your schema `.json` files to contain a `$schema` property
  * This allows you to specify a json-schema for the schema files themselves, providing hints and validation in your editor
  * Add `"$schema": "https://swagger.extrahorizon.com/cli/1.7.0/config-json-schemas/Schema.json"` to the top of your schemas to use the same json-schema as the CLI does internally
* `exh data schemas sync` now allows all components in a schema to have a `description` property
  * These descriptions are not synced, but allow you to provide inline documentation for the components in your schema
* Revamped the schema validation to use the more complete json-schema definition
  * This affects `exh data schemas verify` as well as `exh data schemas sync` and more accurately reports errors in your schemas
  * This also means that some errors that were previously not reported might now be reported
  * We believe this is a good thing moving forward and we're happy to help you resolve any issues you might encounter
  * The `--ignoreSchemaVerificationErrors` flag can always be used to sync while you might be working on a schema with errors
* Fixed some output inconsistencies in the sync commands

### v1.6.1
* `exh data schemas sync` no longer logs the full schema definition json
* Fixed `exh data schemas sync` not being able to traverse an object definition with only `additionalProperties` set

### v1.6.0
* Fixed some security vulnerabilities in the dependencies (Thanks @tran-simon)
* Removed the update notifier. The version of the package we used had security vulnerabilities and we're unable to migrate to the latest version right now. We'll look into this again in the future.
* Added the `exh whoami` command, showing the currently logged in user
* Added the `exh localizations sync` command, allowing you to sync localizations from a folder containing your translations (Thanks @Lroemon for the initial implementation)
* Added localization syncing support to the `exh sync` command
* The `exh sync` command now also supports absolute paths for the `--path` argument

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
