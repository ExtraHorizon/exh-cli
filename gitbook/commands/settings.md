# Settings

The settings sync command allows you to configure platform-level behavior for services such as the Users Service and Files Service. These settings are synchronized to your Extra Horizon environment using the CLI.

## Synchronize settings

The following command reads the `service-settings.json` file and synchronizes the settings with your ExtraHorizon cloud.&#x20;

```
exh settings sync
```

#### Arguments

`--file`

Optional. Path to the JSON file containing the settings. Defaults to `./service-settings.json`.

#### File Format

In `service-settings.json`, settings are grouped into blocks corresponding to the services they belong to.

You can find more information about each configurable setting in the public documentation.\
Read more about the settings for each block on the following pages:

* [Users Service settings](https://docs.extrahorizon.com/extrahorizon/services/access-management/user-service/configuration)
* [File Service settings](https://docs.extrahorizon.com/extrahorizon/services/manage-data/file-service#settings)

{% code title="service-settings.json" %}
```json
{
  "users": {
    "passwordPolicy": {
      "minimumLength": 8,
      "maximumLength": 128,
      "upperCaseRequired": true,
      "lowerCaseRequired": true,
      "symbolRequired": false,
      "numberRequired": true
    },
    "verification": {
      "enablePinCodeActivationRequests": false,
      "enablePinCodeForgotPasswordRequests": false
    },
    "emailTemplates": {
      "activationEmailTemplateName": "activate_account_mail",
      "activationPinEmailTemplateName": "activate_account_mail",
      "reactivationPinEmailTemplateName": "reactivate_account_mail",
      "reactivationEmailTemplateName": "reactivate_account_mail",
      "passwordResetEmailTemplateName": "password_reset_mail",
      "passwordResetPinEmailTemplateName": "password_reset_mail"
    }
  },
  "files": {
    "disableForceDownloadForMimeTypes": ["image/png"]
  },
  "$schema": "https://swagger.extrahorizon.com/cli/1.13.2/config-json-schemas/ServiceSettings.json"
}
```
{% endcode %}

{% hint style="warning" %}
For the User Service email templates, only templates from Template Service V2 are supported, V1 templates cannot be targeted this way.
{% endhint %}

