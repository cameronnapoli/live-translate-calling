import React, { Component } from 'react';
import { StartButton, StopButton } from './components/Buttons';
import { LanguageLabel, LanguageSelector } from './components/Language';
import ResultText from './components/ResultText';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <h1 id="title">Annotation <span className="main-color">&amp;</span> Translation</h1>
        <p id="page-desc">Speech to text and translation with Google Cloud platform. Test out the demo below.</p>

        <div id="top-grid">
          <StartButton />
          <StopButton />

          <LanguageLabel />
          <LanguageSelector />
        </div>

        <div>
          <ResultText />
        </div>
      </div>
    );
  }
}

export default App;
