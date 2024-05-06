# Installation

## Installation <a href="#installation" id="installation"></a>

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

```
exh --help 
```

this should give you the following response:

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
