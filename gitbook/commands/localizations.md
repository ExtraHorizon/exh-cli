# Localizations

Localizations are texts snippets translated into multiple languages. These snippets can be used to provide your application in multiple languages towards your users. Other parts of the Extra Horizon platform like the [Template Service](https://docs.extrahorizon.com/extrahorizon/services/other/template-service/localizations) also can make use of these localizations.

See the [Localization Service](https://docs.extrahorizon.com/extrahorizon/services/other/localizations-service) documentation for more general information about localizations.

## Synchronizing localizations

The CLI is the preferred way to manage localizations. It allows you to create simple JSON files with key-value pairs, one file for each language you want to support. With a single command these files are  transformed to localizations and are then synchronized with your cluster.

### Command

```
exh localizations sync
```

#### Arguments

`--path`

This optional argument allows you to specify the path the localizations should be synchronized from. By default the `localizations` directory is used.

#### Example

Synchronize the localizations from the folder `my-locales`:

```
exh localization sync --path ./my-locales
```

### Folder structure and file format

Localizations should be provided as JSON files in a specific directory. By default, the CLI will search for files with a `.json` extension in the `localizations` directory. The filename serves as the language code. These files should contain simple key-value pairs. An example is provided in the section below.

{% hint style="info" %}
At a minimum a value for the localization keys need to be provided in the default language (English, `en.json`). The supported language codes [can be found here](https://docs.extrahorizon.com/extrahorizon/services/other/localizations-service/language-code).
{% endhint %}

#### Example

```
└── localizations/
    ├── en.json
    └── nl.json
```

{% code title="localizations/en.json" %}
```json
{
  "greeting": "Dear,",
  "farewell": "Kind regards,"
}
```
{% endcode %}

{% code title="localizations/nl.json" %}
```json
{
  "greeting": "Beste,",
  "farewell": "Met vriendelijke groeten,"  
}
```
{% endcode %}

These example files above would be transformed by the CLI to these localizations:

```json
[
  {
    "key": "greetings",
    "text": {
      "EN": "Dear,",
      "NL": "Beste,"
    }
  },
  {
    "key": "farewell",
    "text": {
      "EN": "Kind regards,",
      "NL": "Met vriendelijke groeten,"
    }
  }
]
```
