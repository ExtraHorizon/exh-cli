# Credentials

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
API_HOST=https://env.customer.extrahorizon.io
API_OAUTH_CONSUMER_KEY=****************************
API_OAUTH_CONSUMER_SECRET=****************************
API_OAUTH_TOKEN=****************************
API_OAUTH_TOKEN_SECRET=***************************
```
{% endcode %}

That's it! You should now be ready to use exh-cli

### Environment variables

Instead of using a credentials, it is also possible to pass your credentials as environment variables.  You can even have both! If there is a credentials file and you pass environment variables to the cli, the environment variables will override those in the credentials file

This is convenient when integrating the client in CI/CD or if you want to temporarily override a certain variable in the file.

