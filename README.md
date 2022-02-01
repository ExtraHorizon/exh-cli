# Getting started

To get started with the ExtraHorizon CLI (exh-cli) you'll need to install it and get credentials which will allow you to access the backend.

## Installation <a href="#installation" id="installation"></a>

#### Configuring .npmrc

Assuming you've created a project (using `npm init` or equivalent), you need to create a file called `.npmrc` at the root level of your project and add the following lines:

```
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Replace ${AUTH\_TOKEN} with your personal access token. You can get a new one at [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new). Make sure you enable the `read:packages` scope.

Explanation from GitHub on how to add your token can be found here [https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)

{% hint style="info" %}
You can also add the `.npmrc` to your home directory. In which case it will apply to all your projects.
{% endhint %}

#### Install CLI

Next, install exh-cli in your project as a developer dependency.

{% tabs %}
{% tab title="npm" %}
```
npm install -D @extrahorizon/exh-cli
```
{% endtab %}

{% tab title="yarn" %}
```
yarn add -D @extrahorizon/exh-cli
```
{% endtab %}
{% endtabs %}

In you want to use exh-cli in all your projects, you can also install it globally using

{% tabs %}
{% tab title="npm" %}
```
npm install -g @extrahorizon/exh-cli
```
{% endtab %}

{% tab title="yarn" %}
```
yarn global add @extrahorizon/exh-cli
```
{% endtab %}
{% endtabs %}

#### Configuring your credentials

Next we will configure the credentials which exh-cli needs  to access the ExtraHorizon cloud.  You should have an account on the ExtraHorizon cloud. If not, please contact your representative.

The account credentials you've received  consist of `email` , `password`, `consumerKey`and `consumerSecret`. Together with the `host`, which is the https address of your ExtraHorizon cloud, we will supply these credentials to exh-cli. It will use this to request a token from the ExtraHorizon cloud and this token will subsequently be used to communicate with the ExtraHorizon cloud.

```
exh login --host=https://env.customer.extrahorizon.io --email=youremail 
    --password=yourpassword --consumerKey=yourconsumerkey 
    --consumerSecret=yourconsumersecret
```

This command will create credentials in your home directory in `.exh/credentials`.&#x20;

{% code title="Example ~/.exh/credentials" %}
```
API_HOST=env.customer.extrahorizon.io
API_OAUTH_CONSUMER_KEY=****************************
API_OAUTH_CONSUMER_SECRET=****************************
API_OAUTH_TOKEN=****************************
API_OAUTH_TOKEN_SECRET=***************************
```
{% endcode %}

That's it! You should now be ready to use exh-cli
