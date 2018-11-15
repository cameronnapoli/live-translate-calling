# Speech Processing Server

Server written in Node.js. Collects, audio fragments, translates them, and upon a response from Google cloud, responds with text from audio and translated text.

## Installation

To install cd into directory and run `npm install` to install dependencies.

#### Google Cloud dependencies

For Google Cloud to connect to your account credentials, an environment variable must be set to point to a JSON file with your credentials.

To create the file and set the environment key:

*  First create JSON service account key file following the instructions [here](https://support.google.com/a/answer/7378726?hl=en).
*  Then, following the steps on the [Google quickstart page](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries?authuser=1) set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path to your JSON file. 

For example on Unix:
```source GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json```


#### Running the Server

To start server on port 8000, run `node index.js`.


## Dependencies
    socket.io
    @google-cloud/speech
