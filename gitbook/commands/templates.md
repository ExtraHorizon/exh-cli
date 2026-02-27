# Templates

In the Extra Horizon cloud, you can create mail templates which the mail service can use to send well-formed emails. You can manage these templates with the Extra Horizon client as well.

## Listing templates

List the id, name and the description of all templates:

```
exh templates list
```

To get more information than the three properties listed use the `get` command on a single template.

## Get a single template

To get the full template by `name`

```
exh templates get --name=mytemplate
```

Or by `id`

```
exh templates get --id=620d0eaacff47e000714b13d
```

#### Arguments

`--name`

This argument is used to specify the name of the template to retrieve

`--id`

This argument is used to specify the id of the template to retrieve

## Synchronizing templates

If you want to create a new template, you need to create a json file which defines how it should look like.

Building on that functionality, the CLI offers additional functionality to more easily manage templates and allowing templates to build upon other templates. Once you've built these templates, you can use `exh templates sync [options]` to synchronise these templates to the cloud.

#### Arguments

`--template`

This argument is used to specify the path to the JSON file or the directory that contains a single template to be synced.

`--path`

This argument is used to specify a directory that contains template files/directories to be synced.

### Creating templates <a href="#markdown-header-template-folder-vs-template-file" id="markdown-header-template-folder-vs-template-file"></a>

Templates can be a single json file but in the case where you have multiple pieces of content you can also split the template up into multiple files and put those files in a folder. For example if you have an `html` file which you want to include in the template: it's easier to maintain if you put the `html` file separate instead of inlining it into a json file.

#### Single json file template

This is the easiest case. Everything is contained in the json file. The CLI will use the name of the file (minus the extension) as the template name.

{% code title="welcome_email.json" %}
```json
{
  "description": "Email send to the user to welcome them",
  "inputs": {
    "first_name": { "type": "string" }
  },
  "outputs": {
    "subject": "Welcome to Extra Horizon",
    "body": "Dear {{@inputs.first_name}}, Welcome to Extra Horizon!"
  },
  "$schema": "https://swagger.extrahorizon.com/cli/1.12.0/config-json-schemas/Template.json"
}
```
{% endcode %}

To sync a single template file the `--template`  argument can be supplied with the file name:

```shellscript
exh templates sync --template welcome_email.json
```

#### Folder template

If you prefer to split things up, you can put different parts of your template in separate files into a single folder. The name of the folder will be the name of the resulting template. A folder should contain a `template.json`. **Any other file** in the folder will be read as text and is added to the `outputs` property of the `template.json` file.

Example:

{% code title="password_reset_email/template.json" %}
```json
{
  "description": "Email send to the user in the password reset flow",
  "inputs": {
    "first_name": { "type": "string" },
    "reset_hash": { "type": "string" }
  },
  "outputs": {
    "subject": "Your password reset"
  },
  "$schema": "https://swagger.extrahorizon.com/cli/1.12.0/config-json-schemas/Template.json"
}
```
{% endcode %}

{% code title="password_reset_email/body.hbs" %}
```hbs
Dear {{@inputs.first_name}},

We are sending this message because you initiated a password reset.
You can use the following link to complete your password reset:

https://my-web-plaform.com/reset_password?hash={{@inputs.reset_hash}}

Was it not you who initiated resetting your password? Contact us as soon as possible!

Kind regards,
The team
```
{% endcode %}

Run the CLI to create the template:

```bash
exh templates sync --template password_reset_email
```

From those files, the CLI will build the following resulting template:

```json
{
  "name": "password_reset_email",
  "description": "Email send to the user in the password reset flow",
  "inputs": {
    "first_name": { "type": "string" },
    "reset_hash": { "type": "string" }
  },
  "outputs": {
    "subject": "Your password reset",
    "body": "<The content of `password_reset_email/body.hbs`>"
  }
}
```

#### Syncing multiple templates <a href="#markdown-header-extending-templates" id="markdown-header-extending-templates"></a>

When you define multiple templates in a dedicated folder, you can sync them all at once. For instance, when placing the 2 examples from the earlier sections in a `my-templates`  folder:

```
my-templates/welcome_mail.json
my-templates/password_reset_email/template.json
my-templates/password_reset_email/body.hbs
```

You can sync both templates with a single command by using the `--path` argument:

```shellscript
exh templates sync --path my-templates
```

### Variables <a href="#markdown-header-extending-templates" id="markdown-header-extending-templates"></a>

Templates support **CLI-level variables** that are resolved when running `exh templates sync`. This allows you to reuse values and inject environment-specific configuration into your outputs before the template is uploaded to the cloud.

Variables are defined in a top-level `variables` property inside `template.json`.\
\
Variables can be referenced in the `outputs` in two ways: `$VAR_NAME`  and `${VAR_NAME}` .\
Both syntaxes are supported and behave identically.

#### Defining variables

{% code title="variables-example.json" %}
```json
{
  "variables": {
    "COMPANY_NAME": "Extra Horizon",
    "SUPPORT_EMAIL": "support@example.com"
  },
  "outputs": {
    "subject": "Welcome to $COMPANY_NAME",
    "body": "If you have questions, contact us at ${SUPPORT_EMAIL}."
  }
}
```
{% endcode %}

Syncing the template with the CLI results in a template like this:

```json
{
  "name": "variables-example",
  "outputs": {
    "subject": "Welcome to Extra Horizon",
    "body": "If you have questions, contact us at support@example.com."
  }
}
```

#### Using environment variables in variables

Instead of hardcoding values, you can reference environment variables inside the `variables` section.

This allows templates to adapt automatically to the environment in which the CLI is running (for example: dev, staging, production).\
\
Environment variables can be referenced in the `variables` in two ways: `$ENV_VAR_NAME`  and `${ENV_VAR_NAME}` . Both syntaxes are supported and behave identically.

{% code title="environment-example.json" %}
```json
{
  "variables": {
    "HOST": "${TARGET_HOST}"
  },
  "inputs": {
    "reset_hash": { "type": "string" }
  },
  "outputs": {
    "link": "https://${HOST}/reset_password?hash={{@inputs.reset_hash}}"
  }
}
```
{% endcode %}

* The CLI reads the `variables` section.
* `${TARGET_HOST}` is resolved using your local environment and put in the `HOST` variable.
* `${HOST}` is replaced inside `outputs`.
* The template is synced with `ouputs` with the filled in `HOST` variable

When running something like:

```bash
export TARGET_HOST=staging.my-web-plaform.com
exh templates sync --template environment-example.json
```

Resulting in a template like:

```json
{
  "name": "environment-example",
  "inputs": {
    "reset_hash": { "type": "string" }
  },
  "outputs": {
    "link": "https://staging.my-web-plaform.com/reset_password?hash={{@inputs.reset_hash}}"
  }
}
```

### Extending templates <a href="#markdown-header-extending-templates" id="markdown-header-extending-templates"></a>

Once you've made a number of templates, you'll notice that there are a lot of common things between the different templates and you end up repeating the same thing. This makes management more cumbersome because a single change to those common things will affect multiple files and it's easy to make mistakes. Therefore the CLI supports extending of templates, which means that we can start to build hierarchies of templates.

Templates like, for example, `base_mail` and `base_button_mail` could be extended by other templates.

You can extend from a template by adding an `extendsTemplate`-property to your template.

Extending a template will search for `@inputs.___` variables in the extendable template its `outputs` and will replace them with the extending templates `outputs` with the same name.

#### Example <a href="#markdown-header-example" id="markdown-header-example"></a>

A simplified template to extend from: (containing a `first_name` and `message` reference)

{% code title="basic_template.json" %}
```json
{
  "description": "Basic message template with a greeting",
  "inputs": {
    "first_name": { "type": "string" },
    "message": { "type": "string" },
  },
  "outpus": {
    "body": "Dear {{@inputs.first_name}},\n\n{{@inputs.message}}\n\nKind regards,\nThe team"
  },
  "$schema": "https://swagger.extrahorizon.com/cli/1.12.0/config-json-schemas/Template.json"
}
```
{% endcode %}

A template extending the above template: (passing along its own input `name` to `first_name` and filling the `message` reference)

{% code title="registration_message.json" %}
```json
{
  "extendsTemplate": "basic_template",
  "description": "Message meant to be used after registration",
  "inputs": {
    "name": { "type": "string" }
  },
  "outputs": {
    "first_name": "{{@inputs.name}}",
    "message": "We have successfully received your registration. You can now use our services."
  },
  "$schema": "https://swagger.extrahorizon.com/cli/1.12.0/config-json-schemas/Template.json"
}
```
{% endcode %}

Will result in the following template:

```json
{
  "name": "registration_message",
  "description": "Message meant to be used after registration",
  "inputs": {
    "name": { "type": "string" }
  },
  "outputs": {
    "body": "Dear {{@inputs.name}},\n\nWe have successfully received your registration. You can now use our services.\n\nKind regards,\nThe team"
  }
}

```

#### Note

* The templates from which you extend, do not necessarily need to be in your folder. If the CLI didn't find the template in the specified sync folder, it will query the Extra Horizon cloud. If the template cannot be found there either, an error will be thrown.
* The `sync` command will either create or update a template (if the name already exists). It will never delete a template.

## Deleting templates

Any template can be deleted by using the `delete` command

```
exh templates delete --name=mytemplate
```

Or by id

```
exh templates delete --id=620d0eaacff47e000714b13d
```

#### Arguments

`--name`

This argument is used to specify the name of the template to delete.

`--id`

This argument is used to specify the id of the template to delete.
