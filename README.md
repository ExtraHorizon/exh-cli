# Extra Horizon CLI

This is the command-line interface to the Extra Horizon platform. It allows you to manage schemas & tasks for now, but
will be extended with additional functionality.

See [changelog](CHANGELOG.md) for the latest changes.

## Installation

### Configuring .npmrc
Assuming you've created a project (using npm init or equivalent), you need to create a file called .npmrc at the root level of your project and add the following lines:
```
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```
Replace ${AUTH_TOKEN} with your personal access token. You can get a new one at https://github.com/settings/tokens/new. Make sure you enable the read:packages scope.
Explanation from GitHub on how to add your token can be found here: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages

You can also add the .npmrc to your home directory. In which case it will apply to all your projects.

### Install
*Note: The exh-cli requires at least node version 14*

To install in your project:

Using `npm`:

```
npm install -D @extrahorizon/exh-cli
```
With `yarn`:
```
yarn add -D @extrahorizon/exh-cli
```

It's easier to install it globally so you can use it in all your ExH projects:

```
npm install -g @extrahorizon/exh-cli
```
or
```
yarn global add @extrahorizon/exh-cli
```


## Shell completion

Once installed, you can enable shell completion. With shell completion you get command and option suggestions whenever you use <tab> while typing a command.

For zsh, do
```
exh completion >> ~/.zshrc
```

Bash
```
exh completion >> ~/.bashrc
```

You will need to reload your configuration file (or open a new shell) for the changes to take effect.

## Documentation

For full documentation, please have a look at [Extra Horizon Documentation](https://docs.extrahorizon.com/cli/)

