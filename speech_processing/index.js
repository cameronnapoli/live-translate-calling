'use strict';

// Some sourced from: https://github.com/gabrielpoca/browser-pcm-stream

// Imports the Google Cloud client library
const port = 8000;

const socket = require('socket.io')(port);
const speechToText = require('./speechToText');

console.log("* Listening for socket on port " + port);

socket.on('connection', function (client) {
  console.log("* Client connected.");

  client.on('startGoogleCloudStream', function(request) {
    console.log("* startGoogleCloudStream");
    speechToText.startRecognitionStream(client, request);
  });

  client.on('binaryAudioData', (data) => {
    console.log("* binaryAudioData");
    speechToText.receiveData(data);
  })

  client.on('endGoogleCloudStream', () => {
    console.log("* endGoogleCloudStream");
    speechToText.stopRecognitionStream();
  });

  client.on('disconnect', function () {
    console.log("* Client disconnected.");
  });
});
