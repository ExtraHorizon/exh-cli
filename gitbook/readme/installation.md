# Installation

## Install Node.js

The CLI is available as [a JavaScript package](https://www.npmjs.com/package/@extrahorizon/exh-cli) and requires [Node.js](https://nodejs.org/) to run. If you have Node.js installed you can install the CLI using a JavaScript package manager. For instance, you can use [NPM](https://docs.npmjs.com/about-npm), which comes with Node.js, or alternative package managers like [Yarn](https://yarnpkg.com/).

[Installation instructions for Node.js and NPM can be found here.](https://nodejs.org/en/download)

## Install the CLI

We recommend installing the CLI globally. Installing the CLI globally makes sure it can be used in all your projects. For that reason all examples in this documentation will assume a global installation.

{% tabs %}
{% tab title="npm" %}
```
npm install --global @extrahorizon/exh-cli
```
{% endtab %}

{% tab title="yarn" %}
```
yarn global add @extrahorizon/exh-cli
```
{% endtab %}
{% endtabs %}

For more advanced uses, the CLI can be installed in your project as a development dependency.

{% tabs %}
{% tab title="npm" %}
```
npm install --save-dev @extrahorizon/exh-cli
```
{% endtab %}

{% tab title="yarn" %}
```
yarn add --dev @extrahorizon/exh-cli
```
{% endtab %}
{% endtabs %}

#### Check if the installation worked

When installed globally, trying running the following command in your Terminal to verify whether it's installed correctly.

```
exh --help 
```

this should give you the following response:

```
exh <command>

Commands:
  exh completion               Install shell completion for bash & zsh
  exh data <command>           Manage data
  exh dispatchers <command>    Manage Dispatchers within Extra Horizon
  exh localizations <command>  Manage localizations
  exh login                    Retrieve credentials from ExH
  exh sync                     Sync your ExH configuration to the cloud
                               environment
  exh tasks <command>          Manage tasks
  exh templates <command>      Manage templates
  exh whoami                   Shows the currently logged in user

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

{% hint style="info" %}
If the command isn't recognized, it might be because the yarn global bin folder isn't in your PATH.
{% endhint %}

In case your are using bash, you can add `export PATH="$PATH:$(yarn global bin)"` to your `~/.bash_profile` and reload it with `source ~/.bash_profile`

When installed as a development dependency, run the following command to verify the CLI is working correctly:

{% tabs %}
{% tab title="npx" %}
```
npx exh --help
```
{% endtab %}

{% tab title="yarn" %}
```
yarn exh --help
```
{% endtab %}
{% endtabs %}

## Completion

Enable auto-complete for shell commands with:

```bash
exh completion
```

This command updates either your `~/.zshrc` or `~/.bashrc` file, depending on your shell. Reload your shell using:

```bash
source ~/.zshrc   # For Zsh
```

or

```bash
source ~/.bashrc  # For Bash
```

Now, you can use the tab key to complete commands and view command arguments by typing and pressing tab.
