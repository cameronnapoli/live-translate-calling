'use strict'

// Speech to Text with translated annotations program
// Credit to: https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground

const express = require('express');

// Google Cloud
const speech = require('@google-cloud/speech');
const {Translate} = require('@google-cloud/translate');
// Initialize speech to text API
const speechClient = new speech.SpeechClient();
const projectId = 'speech-translating-annotation';
// Initiate Google Translate API
const translate = new Translate({
  projectId: projectId,
});

const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use('/assets', express.static(__dirname + '/public'));


// ================ EXPRESS ROUTERS ================
app.get('/', function(req, res) {
  res.sendFile('views/index.html', {
    root: __dirname
  });
});


// ================ SOCKET.IO SERVER ================
io.on('connection', function(client) {
  console.log('Client Connected to server');

  let recognizeStream = null;

  client.on('join', function(data) {
    client.emit('messages', 'Socket Connected to Server');
  });

  client.on('messages', function(data) {
    client.emit('broad', data);
  });

  client.on('startGoogleCloudStream', function(targetLanguage) {
    startRecognitionStream(this, targetLanguage);
  });

  client.on('endGoogleCloudStream', function(data) {
    stopRecognitionStream();
  });

  client.on('binaryData', function(data) {
    // console.log(data); //log binary data
    if (recognizeStream !== null) {
      recognizeStream.write(data);
    }
  });

  function startRecognitionStream(client, targetLanguage) {
    console.log("  startRecognitionStream");
    recognizeStream = speechClient.streamingRecognize(request)
      .on('error', console.error)
      .on('data', (data) => {
        process.stdout.write(
          (data.results[0] && data.results[0].alternatives[0]) ?
          `Transcription: ${data.results[0].alternatives[0].transcript}\n` :
          `\n\nReached transcription time limit, press Ctrl+C\n`);

        if (data.results[0] && data.results[0].isFinal) {
          translateText(data.results[0].alternatives[0].transcript, targetLanguage)
            .then(function(translation) {
              client.emit('speechDataWithTranslation', data, translation);
            });

        } else {
          client.emit('speechDataWithTranslation', data, "");
        }

        // After 65 seconds of silence, we restart the stream
        if (data.results[0] && data.results[0].isFinal) {
          console.log('Restarted server stream');
          stopRecognitionStream();
          startRecognitionStream(client, targetLanguage);
        }
      });
  }

  function stopRecognitionStream() {
    console.log("  stopRecognitionStream");
    if (recognizeStream) {
      recognizeStream.end();
    }
    recognizeStream = null;
  }

  function translateText(text, targetLanguage) {
    return translate.translate(text, targetLanguage).then(results => {
      const translation = results[0];
      console.log(`Text: ${text}\nTranslation: ${translation}`);
      return translation;
    })
    .catch(err => {
      console.error('ERROR TRANSLATING:', err);
      return "";
    });
  }
});


// ================ GOOGLE CLOUD CONFIG ================
// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US'; //en-US

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    profanityFilter: false,
    enableWordTimeOffsets: true
  },
  interimResults: true
};


// ================ START SERVER ================
server.listen(port, "127.0.0.1", function() {
  console.log('Server started on port:' + port)
});
