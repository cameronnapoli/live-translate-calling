import React, { Component } from 'react';
import { StartButton, StopButton } from './components/Buttons';
import { LanguageLabel, LanguageSelector } from './components/Language';
import ResultText from './components/ResultText';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isRecording: false,
      languageSelected: "",
      annotations: [] // [{original: "", "translated": "", "language": ""}, ...]
    };

    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  startRecording() {
    console.log("Start recording");
    this.setState({isRecording: true});
    //
  }

  stopRecording() {
    console.log("Stop recording");
    this.setState({isRecording: false});
    //
  }

  changeLanguage(targetLanguage) {
    console.log("Setting target language: " + targetLanguage);
    this.setState({languageSelected: targetLanguage});
    //
  }

  render() {
    return (
      <div className="wrapper">
        <h1 id="title">Annotation <span className="main-color">&amp;</span> Translation</h1>
        <p id="page-desc">Speech to text and translation with Google Cloud platform. Test out the demo below.</p>

        <div id="top-grid">
          <StartButton startRecording={this.startRecording}/>
          <StopButton stopRecording={this.stopRecording}/>

          <LanguageLabel/>
          <LanguageSelector changeLanguage={this.changeLanguage}
                            isRecording={this.state.isRecording}/>
        </div>

        <div>
          <ResultText/>
        </div>
      </div>
    );
  }
}

export default App;
