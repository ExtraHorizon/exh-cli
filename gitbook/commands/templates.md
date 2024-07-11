# Templates

In the Extra Horizon cloud, you can create mail templates which the mail service can use to send well-formed emails. You can manage these templates with the Extra Horizon client as well.

## Listing templates

List the id, name and the description of all templates:

```
exh templates list
```

To get more information than the three properties listed use the `get` command on a single template.

## Get a single template

To get the full template by name

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

This argument is used to specify the path to the JSON file or the directory that contains the single template to be synced.

`--path`

This argument is used to specify the directory that contains all the template files to be synced.

### Creating templates <a href="#markdown-header-template-folder-vs-template-file" id="markdown-header-template-folder-vs-template-file"></a>

Templates can be a single json file but in the case where you have multiple pieces of content you can also split the template up into multiple file and put those files in a folder. For example if you have an html file which you want to include in the template: it's easier to maintain if you put the html file separate instead of inlining it into a json file.

#### Single json file

This is the easiest case. Everything is contained in the json file. The CLI will use the name of the file (minus the extension) as the template name.

#### Folder

If you prefer to split things up, you can put everything into a single folder. The name of the folder will be the name of the resulting template. A folder should contain a `template.json`. **Any other file** in the folder will be read as text and is added to the `fields` property of the `template.json` file.

Example:

`password_reset_email/template.json`

```
{
  "schema": {
    "type": "object",
    "fields": {
      "firstname": {
        "type": "string"
      },
      "reset_hash": {
        "type": "string"
      },
      "tracking_hash": {
        "type": "string"
      }
    }
  },
  "fields": {
    "subject": "Your password reset"
  }
}
```

`password_reset_email/body.txt`

```
Dear $content.first_name,

We are sending this message because you initiated a password reset. You can use the following link to complete your password reset:

https://my-web-plaform-url/reset_password?hash=$content.reset_hash

Was it not you who initiated resetting your password? Contact us as soon as possible!

Kind regards,
The team
```

Run the CLI to create the template:

```bash
exh templetes sync --template password_reset_email
```

From those files, the CLI will build the following resulting template:

```
{
  "name": "password_reset_email",
  "schema": {
    "type": "object",
    "fields": {
      "firstname": {
        "type": "string"
      },
      "reset_hash": {
        "type": "string"
      },
      "tracking_hash": {
        "type": "string"
      }
    }
  },
  "fields": {
    "subject": "Your password reset",
    "body": "<The content of `password_reset_email/body.txt`>"
  }
}
```

### Extending templates <a href="#markdown-header-extending-templates" id="markdown-header-extending-templates"></a>

Once you've made a number of templates, you'll notice that there are a lot of common things between the different templates and you end up repeating the same thing. This makes management more cumbersome because a single change to those common things will affect multiple files and it's easy to make mistakes. Therefore the CLI supports extending of templates, which means that we can start to build hierarchies of templates.

Templates like, for example, `base_mail` and `base_button_mail` could be extended by other templates.

You can extend from a template by adding an `extends_template`-property to your template.

Extending a template will search for `$content.___` variables in the extendable template its fields and will replace them with the extending templates fields with the same name.

#### Example <a href="#markdown-header-example" id="markdown-header-example"></a>

A simplified template to extend from: (containing a `first_name` and `message` reference)

`basic_template.json`

```
{
  "schema": {
    "type": "object",
    "fields": {
      "first_name": {
        "type": "string"
      },
      "message": {
        "type": "string"
      },
    }
  },
  "fields": {
    "body": "Dear $content.first_name,\n\n$content.message\n\nKind regards,\nThe team"
  }
}
```

A template extending the above template: (passing along its own input `name` to `first_name` and filling the `message` reference)

`registration_message.json`

```
{
  "extends_template": "basic_template",
  "schema": {
    "type": "object",
    "fields": {
      "name": {
        "type": "string"
      }
    }
  },
  "fields": {
    "first_name": "$content.name",
    "message": "We have successfully received your registration. You can now use our services."
  }
}
```

Will result in the following template:

```
{
  "name": "registration_message",
  "schema": {
    "type": "object",
    "fields": {
      "name": {
        "type": "string"
      }
    }
  },
  "fields": {
    "body": "Dear $content.name,\n\nWe have successfully received your registration. You can now use our services.\n\nKind regards,\nThe team"
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
