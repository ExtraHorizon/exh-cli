# Permissions required by the CLI

The Extra Horizon CLI requires certain permissions to function correctly. If you, for example, want to create a dedicated user for running commands in a CI/CD pipeline, you need to ensure that this user has the following global permissions:

For the schema commands

* `CREATE_SCHEMAS`
* `UPDATE_SCHEMAS`
* `DELETE_SCHEMAS`
* `DISABLE_SCHEMAS`

For the task commands

* `CREATE_TASK_FUNCTION`
* `VIEW_TASK_FUNCTIONS`
* `VIEW_TASK_FUNCTION_DETAILS`
* `DELETE_TASK_FUNCTION`
* `UPDATE_TASK_FUNCTION`

For tasks using the `executionCredentials` feature, the user also needs:

* `VIEW_USER`
* `CREATE_ROLE`
* `VIEW_ROLE`
* `UPDATE_ROLE`
* `DELETE_ROLE`
* `ADD_ROLE_PERMISSION`
* `REMOVE_ROLE_PERMISSION`
* `ADD_ROLE_TO_USER`
* `REMOVE_ROLE_FROM_USER`

For the dispatchers commands

* `CREATE_DISPATCHERS`
* `UPDATE_DISPATCHERS`
* `DELETE_DISPATCHERS`
* `VIEW_DISPATCHERS`

For the template commands

* `CREATE_TEMPLATES`
* `VIEW_TEMPLATES`
* `UPDATE_TEMPLATES`
* `DELETE_TEMPLATES`

For the localization commands

* `CREATE_LOCALIZATIONS`
* `UPDATE_LOCALIZATIONS`
* `DELETE_LOCALIZATIONS`
