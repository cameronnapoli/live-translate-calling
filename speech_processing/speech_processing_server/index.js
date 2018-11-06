// https://github.com/gabrielpoca/browser-pcm-stream

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

var express = require('express');
var BinaryServer = require('binaryjs').BinaryServer;
var wav = require('wav');



console.log("Starting binary server");
binaryServer = BinaryServer({port: 9001});
var outFile = 'audio_files/demo.wav';

binaryServer.on('connection', function(client) {
  console.log('New client connection');
  var fileWriter;

  client.on('stream', function(stream, meta) {
    console.log('new stream');

    fileWriter = new wav.FileWriter(outFile, {
     channels: 1,
     sampleRate: 48000,
     bitDepth: 16
    });

    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
      console.log('wrote to file ' + outFile);
    });
  });

  client.on('error', function(error) {
    console.log("Client error sent");
  });

  client.on('close', function() {
    console.log("Closing client");
  });
});

binaryServer.on('error', function(error) {
  console.log("Error thrown: " + error);
});



// // Google Cloud Audio to text streaming example

// // Creates a client
// const client = new speech.SpeechClient();
//
// /**
//  * TODO(developer): Uncomment the following lines before running the sample.
//  */
// // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// // const sampleRateHertz = 16000;
// // const languageCode = 'BCP-47 language code, e.g. en-US';
//
// const request = {
//   config: {
//     encoding: encoding,
//     sampleRateHertz: sampleRateHertz,
//     languageCode: languageCode,
//   },
//   interimResults: false, // If you want interim results, set this to true
// };
//
// // Create a recognize stream
// const recognizeStream = client
//   .streamingRecognize(request)
//   .on('error', console.error)
//   .on('data', data =>
//     process.stdout.write(
//       data.results[0] && data.results[0].alternatives[0]
//         ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
//         : `\n\nReached transcription time limit, press Ctrl+C\n`
//     )
//   );
//
// // Start recording and send the microphone input to the Speech API
// record
//   .start({
//     sampleRateHertz: sampleRateHertz,
//     threshold: 0,
//     // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
//     verbose: false,
//     recordProgram: 'rec', // Try also "arecord" or "sox"
//     silence: '10.0',
//   })
//   .on('error', console.error)
//   .pipe(recognizeStream);
//
// console.log('Listening, press Ctrl+C to stop.');
