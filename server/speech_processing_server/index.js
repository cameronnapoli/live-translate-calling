'use strict';

// https://github.com/gabrielpoca/browser-pcm-stream

// Imports the Google Cloud client library
const port = 8000;

const socket = require('socket.io')(port);
const speechToTextUtils = require('./speechToTextUtils');

console.log("* Listening for socket on port " + port);

socket.on('connection', function (client) {
  console.log("* Client connected.");

  client.on('startGoogleCloudStream', function(request) {
    console.log("* startGoogleCloudStream");
    speechToTextUtils.startRecognitionStream(client, request);
  });

  client.on('binaryAudioData', (data) => {
    console.log("* binaryAudioData");
    speechToTextUtils.receiveData(data);
  })

  client.on('endGoogleCloudStream', () => {
    console.log("* endGoogleCloudStream");
    speechToTextUtils.stopRecognitionStream();
  });

  client.on('disconnect', function () {
    console.log("* Client disconnected.");
  });
});