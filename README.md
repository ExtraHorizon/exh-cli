# Extra Horizon CLI

This is the command-line interface to the Extra Horizon platform. It allows you to manage schemas & tasks for now, but
will be extended with additional functionality.

See [changelog](CHANGELOG.md) for the latest changes.

## Installation

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

