---
description: Simple example on how to interact with the Extrahorizon API using python
---

# API interaction (Python)

The Extra horizon SDK currently does not support Python, but fear not: it's perfectly possible to interact with the platform through our API!&#x20;

At [https://docs.extrahorizon.com/extrahorizon/api-reference/api-specs](https://docs.extrahorizon.com/extrahorizon/api-reference/api-specs) you'll find the complete API documentation.

Have a look at  the following example which simply prints your user information. Then we'll go over it step by step.

<pre class="language-python" data-line-numbers><code class="lang-python"><strong>from requests_oauthlib import OAuth1Session
</strong>import os

def handler(event, context):
    exhConsumerKey = os.environ['CONSUMER_KEY']
    exhConsumerSecret = os.environ['CONSUMER_SECRET']
    exhAccessToken = os.environ['ACCESS_TOKEN']
    exhTokenSecret = os.environ['TOKEN_SECRET']

    oauth = OAuth1Session(client_key=exhConsumerKey,
                          client_secret=exhConsumerSecret,
                          resource_owner_key=exhAccessToken,
                          resource_owner_secret=exhTokenSecret)

    result = oauth.get('https://&#x3C;your.extrahorizon.url>/users/v1/me')
    
    print(result.content)
</code></pre>

There are 2 methods of make authenticated calls: OAUTH1 & OAUTH2. The easiest way for a task to interact with the API is through the use of OAUTH1 tokens. These tokens can be generated offline and do not expire unless you regenerate them. This saves you from having to refresh & store tokens, which is the case with OAUTH2.\


#### Getting credentials

```python
    exhConsumerKey = os.environ['CONSUMER_KEY']
    exhConsumerSecret = os.environ['CONSUMER_SECRET']
    exhAccessToken = os.environ['ACCESS_TOKEN']
    exhTokenSecret = os.environ['TOKEN_SECRET']
```

There are 4 different credentials passed to the task through environment variables. Of these, `CONSUMER_KEY` & `CONSUMER_SECRET` are system-wide credentials identifying the OAUTH1 application. These are usually communicated by Extra horizon after commissioning.

`ACCESS_TOKEN` & `TOKEN_SECRET` are personal tokens which you need to generate. This is fairly straightforware using the Extra horizon API. Using the terminal and curl, you can do:

{% code overflow="wrap" %}
```bash
curl -X POST https://<your.extrahorizon.url>/auth/v2/oauth1/tokens  -H 'Content-Type: application/json' -d '{ "email": "<youremail>", "password": "<yourpassword>" }'
```
{% endcode %}

Note: replace `<your.extrahorizon.url>` , `<youremail>`, `<yourpassword>` with your actual values.

which will return something of the form

```json
{
    "applicationId":"16574811b2148f3b28ab34bd",
    "userId":"58ff75ab34ddfd0005f80951",
    "token":"9977939d4101ddee14357267f5dabf1f3b3b3d15e",
    "tokenSecret":"7badabc98348d8b9c5d7c9b7addfac3152f540",
    "updateTimestamp":"2023-09-18T14:59:23.676Z",
    "creationTimestamp":"2023-09-18T14:59:23.676Z",
    "id":"650865cbef5f2da9295bcef7"
}
```

Get the `token` & `tokenSecret` values and pass them to your task as `ACCESS_TOKEN` & `TOKEN_SECRET`.&#x20;

#### Setting up an OAUTH1 session

```python
    oauth = OAuth1Session(client_key=exhConsumerKey,
                          client_secret=exhConsumerSecret,
                          resource_owner_key=exhAccessToken,
                          resource_owner_secret=exhTokenSecret)
```

Here we're using the `requests_oauthlib` python library to create an oauth session for us. See also [here](https://requests-oauthlib.readthedocs.io/en/latest/oauth1\_workflow.html) for more information regarding the OAUTH1 workflow.



#### Executing an API call

And then finally we can do our API call & print the result. Again, replace the host with the actual url of your Extra horizon installation.

```python
    result = oauth.get('https://<your.extrahorizon.url>/users/v1/me')
    
    print(result.content)
```

That's it, now you're ready to :rocket:!
