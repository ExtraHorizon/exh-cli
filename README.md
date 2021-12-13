# Getting started

To get started with the ExtraHorizon SDK you'll need to install it, and then get credentials which will allow you to access the backend.

## Installation <a href="#installation" id="installation"></a>

In your project, if you are using yarn or npm you need to create a file called `.npmrc` at the root level of your project and add these lines. Replace ${AUTH\_TOKEN} with your personal access token. You can get a new one at [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new). Make sure you enable the `read:packages` scope.

```
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found here [https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)

{% tabs %}
{% tab title="npm" %}
```
npm install @extrahorizon/exh-cli
```
{% endtab %}

{% tab title="yarn" %}
```
yarn add @extrahorizon/exh-cli
```
{% endtab %}
{% endtabs %}
