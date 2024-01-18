---
description: Hello world docker tutorial for Extra Horizon task functions
---

# Hello World (Docker)

In this simple tutorial we will show you how you can build task functions using docker. First we need to create a folder with the following files:

* A **app.py** file that will contain our hello-world code
* A **Dockerfile** to build our container&#x20;

{% code title="app.py" lineNumbers="true" %}
```python
def handler(event, context):
    print("Hello world!")
```
{% endcode %}

We will create a handler function that will act as the entrypoint of your task.&#x20;

{% code title="Dockerfile" lineNumbers="true" %}
```docker
FROM public.ecr.aws/lambda/python:3.9

# Copy function code
COPY app.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]
```
{% endcode %}

Extra Horizon Task Functions are based on AWS Lambda. Because of this we need to make sure our container is based on a lambda container image (You can finder all the different images available on [https://public.ecr.aws/](https://public.ecr.aws/)).&#x20;

Next we make sure that when we build our image our app.py code is copied to the container.

Finally we need to make sure our handler function is triggered when we start our container. We can do this by passing **"app.handler"** as a command parameter.&#x20;

### Building the docker image

You can build the example docker image as follows:

{% code lineNumbers="true" %}
```sh
docker build -t <registry-url>/<image-name>:<your-tag> .
```
{% endcode %}

Please replace `<your-tag>` by whatever tag you choose to give the image. This tag is important because later on we need to tell the task which docker image to use and having a friendly name is definitely easier than a long hash :)

### Gaining access to the docker registry

When ready to try, Extrahorizon will provide a token file, which you can use to authenticate against the docker repository by doing as follows in a shell:

```sh
cat <token-file> | docker login --username AWS --password-stdin <registry-url>/<image-name>
```

This is, of course, assuming some kind of unix shell (linux, MacOS, ...). You might need to tweak it a bit for Windows. The idea is that the token file is fed to the `docker login` process through stdin. If all goes well, you should see `Login Succeeded` being shown.

### Sending the docker image to the register

If the registry is authenticated, you just need to:

```
docker push <registry-url>/<image-name>:<your-tag>
```

Remember to replace `<your-tag>` by whatever tag you chose in the build process

### Running the task

Please notify Extrahorizon when a docker image is uploaded. For now we need to manually manage the task to ensure it is using the correct image. Later on, we will integrate this functionality in our API so that this manual step is no longer necessary.

### Important

When using a docker-based task, do **not** use the `exh-cli` to manage your task (create/update). The result of doing so is uncertain.
