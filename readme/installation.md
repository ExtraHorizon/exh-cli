# Installation

## Installation <a href="#installation" id="installation"></a>

#### Configuring .npmrc

Assuming you've created a project (using `npm init` or equivalent), you need to create a file called `.npmrc` at the root level of your project and add the following lines:

```
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=AUTH_TOKEN
```

Replace `AUTH_TOKEN` with your personal access token. You can get a new one at [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new). Make sure you enable the `read:packages` scope.

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

#### Check if the installation worked

When installed globally, trying running the following command in your Terminal to verify wether it's installed correctly.

{% code lineNumbers="true" %}
```
exh --help 
```
{% endcode %}

this should give you the following response:

{% code lineNumbers="true" %}
```
exh <command>

Commands:
  exh completion             Install shell completion for bash & zsh
  exh data <command>         Manage data
  exh dispatchers <command>  Manage Dispatchers within Extra Horizon
  exh login                  Retrieve credentials from ExH
  exh sync                   Upload all schemas, templates & tasks to the cloud
                             environment
  exh tasks <command>        Manage tasks
  exh templates <command>    Manage templates

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```
{% endcode %}

{% hint style="info" %}
If the command isn't recognized, it might be because the yarn global bin folder isn't in your PATH.
{% endhint %}

In case your are using bash, you can add `export PATH="$PATH:$(yarn global bin)"` to your `~/.bash_profile` and reload it with `source ~/.bash_profile`

#### Completion

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
