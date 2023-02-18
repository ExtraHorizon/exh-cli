# Hello world (Py)

### src/Index.py

First let's create a simple hello-world script. We are creating a function called handler() that will act as the entryPoint of our code. Our goal is to print a simple "hello world" to the console.

{% code title="index.py" lineNumbers="true" %}
```python
def handler(event, context):
    print('Hello World!');
```
{% endcode %}

If you are using visual studio code, this should look something like this:

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 08.58.26.png" alt=""><figcaption></figcaption></figure>

### task-config.json

Next we need to create a configuration file that the Extra Horizon CLI can use to configure and deploy your function to you cluster.

To create the our function we need to provide the following information:

* Name of the function
* A description
* Reference to the directory containing the (built) code (`code`)
* the entrypoint or the function that should be invoked when the function is triggered
* the runtime you want your code to use

For our function it looks something like this:

{% code title="task-config.json" lineNumbers="true" %}
```json
{
    "name": "hello-world-python",
    "description": "python hello world example",
    "path": "src",
    "entryPoint": "index.handler",
    "runtime": "python3.9"
}
```
{% endcode %}

In visual studio code your project should something like this:

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 09.09.52.png" alt=""><figcaption></figcaption></figure>

### Deploying with the ExH CLI

You can deploy your function to the task service using the EXH CLI Tool. run the sync task command in your terminal:

```
exh tasks sync --path=./task-config.json
```

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 09.12.44.png" alt=""><figcaption></figcaption></figure>

You can see a hello-world function has been created in the task service. Visit the [Task service documentation](https://app.gitbook.com/o/-MkCjSW-Ht0-VBM7yuP9/s/-Mi5veV04lYlkS769Dcp/) for more information.

### Running your task using postman

Using postman we can create a new task execution for our hello-world function. Create a http POST method and mention the function name.

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 09.16.42.png" alt=""><figcaption></figcaption></figure>

### Verify using the ExH Control Center

You can log into the Extra Horizon control center to verify the execution of your function.

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 09.20.53.png" alt=""><figcaption></figcaption></figure>

Go to tasks>hello-world-python>executions.&#x20;

<figure><img src="../../.gitbook/assets/Scherm­afbeelding 2023-02-18 om 09.21.31.png" alt=""><figcaption></figcaption></figure>

Success!! :tada:You just created your first python function in Extra Horizon

### Tips

{% hint style="info" %}
When you want add dependencies to your code. You can just add them to your src folder and the CLI will upload them to the environment. Make sure to only include essential dependencies as there is a 10MB limit for the entire size of your code.
{% endhint %}

{% hint style="info" %}
In case you need to create functions larger than 10MB you can use docker. Please contact the Extra Horizon team via support@extrahorizon.com or via your dedicated slack channel on how to deploy your docker images.&#x20;
{% endhint %}
