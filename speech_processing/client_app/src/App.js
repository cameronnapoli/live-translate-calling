import React, { Component } from "react";
import {BinaryClient} from 'binaryjs-client';
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      record_button_visibile: false
    };

    this.onRecordStart = this.onRecordStart.bind(this);
    this.onRecordStop = this.onRecordStop.bind(this);
  }

  componentWillMount() {
    let client = new BinaryClient('ws://localhost:9001');

    client.on('open', function() {
      var recording = false;

      window.startRecording = function() {
        window.Stream = client.createStream();

        if (!navigator.getUserMedia) {
          navigator.getUserMedia = navigator.getUserMedia ||
                                   navigator.webkitGetUserMedia ||
                                   navigator.mozGetUserMedia ||
                                   navigator.msGetUserMedia;
        }

        if (navigator.getUserMedia) {
          navigator.getUserMedia({audio:true}, success, function(e) {
            alert('Error capturing audio.');
          });
        } else {
          alert('getUserMedia not supported in this browser.');
        }

        recording = true;
      }

      window.stopRecording = function() {
        recording = false;
        window.Stream.end();
      }

      function success(e) {
        let audioContext = window.AudioContext || window.webkitAudioContext;
        let context = new audioContext();

        // the sample rate is in context.sampleRate
        let audioInput = context.createMediaStreamSource(e);

        var bufferSize = 2048;
        let recorder = context.createScriptProcessor(bufferSize, 1, 1);

        recorder.onaudioprocess = function(e){
          if (!recording) {
            return;
          }
          console.log('recording');

          var left = e.inputBuffer.getChannelData(0);
          window.Stream.write(convertoFloat32ToInt16(left));
        }

        audioInput.connect(recorder)
        recorder.connect(context.destination);
      }

      function convertoFloat32ToInt16(buffer) {
        let l = buffer.length;
        let buf = new Int16Array(l)

        while (l--) {
          buf[l] = buffer[l] * 0x7FFF;
        }
        return buf.buffer
      }
    });
  }

  onRecordStart() {
    console.log("Recording starting...");
    this.setState({record_button_visibile: true});
    window.startRecording();
  }

  onRecordStop() {
    console.log("Recording stopping...");
    this.setState({record_button_visibile: false});
    window.stopRecording();
  }

  render() {
    return (
      <div className="App">
        <h1>Audio Translate App</h1>

        <div className="recording-circle" style={{
            visibility: this.state.record_button_visibile ? "visible" : "hidden"
          }}>
        </div>

        <input id="start-button"
               type="button"
               value="Start Recording"
               onClick={this.onRecordStart}/>

        <input id="stop-button"
               type="button"
               value="Stop Recording"
               onClick={this.onRecordStop}/>

       <div className="translation-response"></div>
      </div>
    );
  }
}

export default App;
