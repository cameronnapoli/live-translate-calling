import React, { Component } from 'react';
import { StartButton, StopButton } from './components/Buttons';
import { LanguageLabel, LanguageSelector } from './components/Language';
import ResultText from './components/ResultText';

import openSocket from 'socket.io-client';
import { downsampleBuffer } from './helpers.js';


let BUFFER_SIZE = 2048,
    AudioContext, context, processor, input, globalStream;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isStreaming: false,
      // languageSelected: { value: 'es', label: "Spanish" },
      languageSelected: { value: 'en', label: "English" },
      annotations: [] // [{original: "", translated: "", language: ""}, ...]
    };

    this.socket = openSocket("http://localhost:8000");

    var receiveData = (data, translation) => {
      let words = data.results[0].alternatives[0].transcript;

      let annotationObj = {
        original: words,
        translated: "",
        language: this.state.languageSelected
      };

      let isDataFinal = undefined || data.results[0].isFinal;
      if (isDataFinal === true) {
        annotationObj.translated = translation;
      }

      let newAnnotations = this.state.annotations.slice();
      newAnnotations.pop();
      newAnnotations.push(annotationObj);

      if (isDataFinal === true) {
        newAnnotations.push({}); // Push empty object to finalize translation line
      }

      this.setState({
        annotations: newAnnotations
      });
    };
    this.socket.on("speechDataWithTranslation", receiveData);

    var endStream = () => {
      if (this.state.isStreaming) {
        this.socket.emit('endGoogleCloudStream', '');
      }
    }
    window.onbeforeunload = endStream;

    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  startRecording() {
    this.setState({isStreaming: true});
    this.initRecording();
  }

  stopRecording() {
    this.setState({isStreaming: false});

    this.socket.emit("endGoogleCloudStream", "");

    if (globalStream) {
      let track = globalStream.getTracks()[0];
      track.stop();

      input.disconnect(processor);
      processor.disconnect(context.destination);

      context.close().then(() => {
        input = null;
        processor = null;
        context = null;
        AudioContext = null;
      });
    }
  }

  changeLanguage(targetLanguage) {
    this.stopRecording()
    this.setState({languageSelected: targetLanguage});
  }

  initRecording() {
    this.socket.emit('startGoogleCloudStream', this.state.languageSelected.value);

    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    processor = context.createScriptProcessor(BUFFER_SIZE, 1, 1);
    processor.connect(context.destination);
    context.resume();

    var microphoneProcess = (e) => {
      let left16 = downsampleBuffer(e.inputBuffer.getChannelData(0), 44100, 16000);
      this.socket.emit("binaryData", left16);
    }

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
        <div id="header">
          <span id="title">Speech Annotation &amp; Translation</span>
        </div>

        <div id="content">
          <p id="page-description">
            Speech to text and translation with Google Cloud platform. Test out the demo below.
          </p>

          <div id="top-grid">
            <StartButton
              startRecording={this.startRecording}
              isActive={this.state.isStreaming}
            />
            <StopButton
              stopRecording={this.stopRecording}
              isActive={this.state.isStreaming}
            />
            <LanguageLabel/>
            <LanguageSelector
              changeLanguage={this.changeLanguage}
              languageSelected={this.state.languageSelected}
            />
          </div>

          <div className="result-text-container">
            <ResultText
              annotations={this.state.annotations}
              currentSpeechText={this.state.currentSpeechText}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
