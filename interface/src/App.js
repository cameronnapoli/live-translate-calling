import React, { Component } from 'react';
import { StartButton, StopButton } from './components/Buttons';
import { LanguageLabel, LanguageSelector } from './components/Language';
import ResultText from './components/ResultText';

import openSocket from 'socket.io-client';
import { downsampleBuffer } from './helpers.js';


let bufferSize = 2048,
    AudioContext, context, processor, input, globalStream;
    

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isStreaming: false,
      languageSelected: "es",
      annotations: [] // [{original: "", "translated": "", "language": ""}, ...]
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
        newAnnotations.push({}); // Push empty object to finalize this transcript
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
    this.socket.emit('startGoogleCloudStream', this.state.languageSelected);

    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    processor = context.createScriptProcessor(bufferSize, 1, 1);
    processor.connect(context.destination);
    context.resume();

    var microphoneProcess = (e) => {
      let left = e.inputBuffer.getChannelData(0);
      let left16 = downsampleBuffer(left, 44100, 16000)
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
        <h1 id="title">Annotation <span className="main-color">&amp;</span> Translation</h1>
        <p id="page-desc">Speech to text and translation with Google Cloud platform. Test out the demo below.</p>

        <div id="top-grid">
          <StartButton startRecording={this.startRecording}
                       isActive={this.state.isStreaming}/>
          <StopButton stopRecording={this.stopRecording}
                      isActive={this.state.isStreaming}/>

          <LanguageLabel/>
          <LanguageSelector changeLanguage={this.changeLanguage}
                            languageSelected={this.state.languageSelected}
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
