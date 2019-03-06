import React, { Component } from 'react';
import { StartButton, StopButton } from './components/Buttons';
import { LanguageLabel, LanguageSelector } from './components/Language';
import ResultText from './components/ResultText';

import openSocket from 'socket.io-client';
var socket = openSocket('http://localhost:8000');

// TODO: Change from global to class level variables
let bufferSize = 2048,
    AudioContext, context, processor, input, globalStream;

window.onbeforeunload = function() {
  // if is streaming
  socket.emit('endGoogleCloudStream', '');
};

// ================ HELPERS ================
function microphoneProcess(e) {
  let left = e.inputBuffer.getChannelData(0);
  let left16 = downsampleBuffer(left, 44100, 16000)
  socket.emit('binaryData', left16);
}

function downsampleBuffer(buffer, sampleRate, outSampleRate) {
  if (outSampleRate >= sampleRate) {
    throw new Error("downsampling rate should be smaller than original sample rate");
  }
  let sampleRateRatio = sampleRate / outSampleRate;
  let newLength = Math.round(buffer.length / sampleRateRatio);
  let result = new Int16Array(newLength);
  let offsetResult = 0, offsetBuffer = 0;

  while (offsetResult < result.length) {
    let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }

    result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result.buffer;
}


class App extends Component {
  constructor(props) {
    super(props);

    socket.on('connect', function(data) {
      socket.emit('join', 'Server Connected to Client');
    });

    socket.on('messages', function(data) {
      console.log(data);
    });

    socket.on('speechDataWithTranslation', function(data, translation) {
      console.log(data);
      console.log(translation);

      let dataFinal = undefined || data.results[0].isFinal;
      let words;

      if (dataFinal === false) {
        words = data.results[0].alternatives[0].words;
        let sentence = words.map((wordObj) => wordObj.word).join(' ');

        this.setState({
          currentSpeechText: sentence
        });
      } else if (dataFinal === true) {
        words = data.results[0].alternatives[0].transcript.split(" ")
                  .map((word) => { return {word: word} });
        let sentence = words.map((wordObj) => wordObj.word).join(' ');

        let annotationObj = {
          original: sentence,
          translated: translation,
          language: this.state.languageSelected
        };

        let newAnnotations = this.state.annotations.slice();
        newAnnotations.push(annotationObj);

        this.setState({
          annotations: newAnnotations,
          currentSpeechText: ""
        });
      }
    });

    this.state = {
      isStreaming: false,
      languageSelected: '',
      annotations: [], // [{original: "", "translated": "", "language": ""}, ...]
      currentSpeechText: ""
    };

    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  startRecording() {
    console.log("Start recording");
    this.setState({isStreaming: true});
    this.initRecording();
  }

  stopRecording() {
    console.log("Stop recording");
    this.setState({isStreaming: false});

    socket.emit('endGoogleCloudStream', '');

    if (globalStream) {
      let track = globalStream.getTracks()[0];
      track.stop();

      input.disconnect(processor);
      processor.disconnect(context.destination);

      context.close().then(function() {
        input = null;
        processor = null;
        context = null;
        AudioContext = null;
      });
    }
  }

  changeLanguage(targetLanguage) {
    console.log("Setting target language: " + targetLanguage);
    this.stopRecording()
    this.setState({languageSelected: targetLanguage});
  }

  initRecording() {
    socket.emit('startGoogleCloudStream', this.state.languageSelected); // init socket Google Speech Connection

    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    processor = context.createScriptProcessor(bufferSize, 1, 1);
    processor.connect(context.destination);
    context.resume();

    var handleSuccess = function(stream) {
      globalStream = stream;
      input = context.createMediaStreamSource(stream);
      input.connect(processor);

      processor.onaudioprocess = function(e) {
        microphoneProcess(e);
      };
    };

    const constraintsGCloud = {
      audio: true,
      video: false
    };

    navigator.mediaDevices.getUserMedia(constraintsGCloud).then(handleSuccess);
  }

  render() {
    return (
      <div className="wrapper">
        <h1 id="title">Annotation <span className="main-color">&amp;</span> Translation</h1>
        <p id="page-desc">Speech to text and translation with Google Cloud platform. Test out the demo below.</p>

        <div id="top-grid">
          <StartButton startRecording={this.startRecording}
                       isActive={this.state.isStreaming}/>
          <StopButton stopRecording={this.stopRecording}
                      isActive={this.state.isStreaming}/>

          <LanguageLabel/>
          <LanguageSelector changeLanguage={this.changeLanguage}
                            isRecording={this.state.isStreaming}/>
        </div>

        <div>
          <ResultText annotations={this.state.annotations}
                      currentSpeechText={this.state.currentSpeechText}/>
        </div>
      </div>
    );
  }
}

export default App;
