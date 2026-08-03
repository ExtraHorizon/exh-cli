# Login

Before you can start using the Extra Horizon Command Line Interface (exh-cli) to interact with your Extra Horizon cloud, it is essential to configure the necessary credentials. Ensure that you have an active account on the Extra Horizon cloud. If you don't have an account yet, kindly reach out to your designated representative to set up your account.

Account Credentials

* Email: The email address associated with your Extra Horizon account
* Password: The password linked to your Extra Horizon account
* Consumer Key and Consumer Secret: Unique identifiers provided to you during the account setup process.
* Host: The url of your Extra Horizon cloud

## Providing credentials to the CLI

There are three different methods to provide credentials to the exh-cli:

### Login Command

To provide your credentials to the CLI, the following command can be used:

```
exh login \
    --host=https://api.env.my-project.extrahorizon.io \
    --email=youremail \
    --password=yourpassword \
    --consumerKey=yourconsumerkey \
    --consumerSecret=yourconsumersecret
```

This command will create a file (`.exh/credentials`) in your home directory containing your credentials.

### Creating a credentials file

It is also possible to create the file yourself. Create a file in your home directory `.exh/credentials` with the following information:

```
API_HOST=https://env.my-project.extrahorizon.io
API_OAUTH_CONSUMER_KEY=****************************
API_OAUTH_CONSUMER_SECRET=****************************
API_OAUTH_TOKEN=****************************
API_OAUTH_TOKEN_SECRET=***************************
```

### Environment variables

Instead of using a credentials file, it is also possible to pass your credentials as environment variables. The names of the environment variables must match the names of the keys in the credentials file.

You can even have both the file and the environment variable! If there is a credentials file and you pass environment variables to the cli, the environment variables will override those in the credentials file. This is convenient when integrating the client in CI/CD or if you want to temporarily override a certain variable in the file.

## Testing the credentials

You can test if the credentials you configured are (still) correct by using the following command:

```
exh whoami
```

When everything it is set up correctly, the command will return something like:

```
You are targeting: https://env.my-project.extrahorizon.io
You are logged in as: your.email@my-project.com
```
