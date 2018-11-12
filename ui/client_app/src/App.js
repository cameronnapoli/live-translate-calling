import React, { Component } from "react";
import "./App.css";
import AudioStreamer from './AudioStreamer';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false
    };

    this.onRecordStart = this.onRecordStart.bind(this);
    this.onRecordStop = this.onRecordStop.bind(this);
  }

  componentWillMount() {}

  onRecordStart() {
    console.log("Recording starting...");
    this.setState({recording: true});

    AudioStreamer.initRecording((data) => {},
      (error) => {console.log("Error recording " + error);});
  }

  onRecordStop() {
    console.log("Recording stopping...");
    this.setState({recording: false});
    AudioStreamer.stopRecording();
  }

  render() {
    return (
      <div className="App">
        <h1>Audio Translate App</h1>

        <div className="recording-circle" style={{
            visibility: this.state.recording ? "visible" : "hidden"
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

        <div>
          {this.state.timestamp}
        </div>

        <div className="translation-response"></div>
      </div>
    );
  }
}

export default App;
