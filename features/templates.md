# Templates

In the Extra Horizon cloud, you can create mail templates which the mail service can use to send well-formed emails. You can manage these templates with the Extra Horizon client as well.&#x20;

## Listing templates

To list all the templates, do

```
exh templates list
```

It will not list all the details of the template, just `id`, `name` & `description`

## Get a single template

To get the full template by name

```
exh templates get --name=mytemplate
```

Or by `id`

```
exh templates get --id=620d0eaacff47e000714b13d
```

## Synchronizing template

If you want to create a new template, you need to create a json file which defines how it should look like. See [Extrahorizon documentation](https://docs.extrahorizon.com/template-service/features/templates) to get more information on creating templates.

Building on that functionality, the CLI offers additional functionality to more easily manage templates and allowing templates to build upon other templates. Once you've built these templates, you can use `exh templates sync [options]` to synchronise these templates to the cloud.

There are 2 ways to use the sync command:

1. Sync a single json template using the `template` option. This can be a file or a folder, depending on how you defined your template (see next paragraph).
2. Sync a folder which contains templates using the `path` option.

### Creating templates <a href="#markdown-header-template-folder-vs-template-file" id="markdown-header-template-folder-vs-template-file"></a>

Templates can be a single json file but in the case where you have multiple pieces of content you can also split the template up into multiple file and put those files in a folder. For example if you have an html file which you want to include in the template: it's easier to maintain if you put the html file separate instead of inlining it into a json file.&#x20;

#### Single json file

This is the easiest case. Everything is contained in the json file. The CLI will use the name of the file (minus the extension) as the template name.

#### Folder

If you prefer to split things up, you can put everything into a single folder. The name of the folder will be the name of the resulting template. A folder should contain a  `template.json`. **Any other file** in the folder will be read as text and is added to the `fields` property of the `template.json` file.

Example:

`password_changed_message/template.json`

```
{
  "schema": {
    "type": "object",
    "fields": {
      "first_name": {
        "type": "string"
      }
    }
  },
  "fields": {
    "subject": "Your password changed"
  }
}
```

`password_changed_message/body.txt`

```
Dear $content.first_name,

We are sending this message to inform you that your password was changed. If you initiated this yourself you can safely ignore this message.

Was it not you who changed your password? Contact us as soon as possible!

Kind regards,
The team
```

From those files, the CLI will build the following resulting template:

```
{
  "name": "password_changed_message",
  "schema": {
    "type": "object",
    "fields": {
      "first_name": {
        "type": "string"
      }
    }
  },
  "fields": {
    "subject": "Your password changed",
    "body": "Dear $content.first_name,\n\nWe are sending this message to inform you that your password was changed. If you initiated this yourself you can safely ignore this message.\n\nWas it not you who changed your password? Contact us as soon as possible!\n\nKind regards,\nThe team"
  }
}
```

### Extending templates <a href="#markdown-header-extending-templates" id="markdown-header-extending-templates"></a>

Once you've made a number of templates, you'll notice that there are a lot of common things between the different templates and you end up repeating the same thing. This makes management more cumbersome because a single change to those common things will affect multiple files and it's easy to make mistakes. Therefore the CLI supports extending of templates, which means that we can start to build hierarchies of templates.

Templates like, for example, `base_mail` and `base_button_mail` could be extended by other templates.&#x20;

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
