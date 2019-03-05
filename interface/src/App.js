import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <h1 id="title">Annotation <span className="main-color">&amp;</span> Translation</h1>
        <p id="page-desc">Speech to text and translation with Google Cloud platform. Test out the demo below.</p>

        <div id="top-grid">
          <div id="start-rec-button-box">
            <button id="start-rec-button" type="button"> Start recording</button>
          </div>
          <div id="stop-rec-button-box">
            <button id="stop-rec-button" type="button" disabled> Stop recording</button>
          </div>

          <div id="target-language-label">
            <label id="target-language-label" htmlFor="target-language">
              Target Language:&nbsp;
            </label>
          </div>
          <div id="target-language-box">
            <select id="target-language">
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="is">Icelandic</option>
              <option value="it">Italian</option>
              <option value="ru">Russian</option>
            </select>
            <div id="recording-status">&nbsp;</div>
          </div>
        </div>

        <div>
          <p id="resultText">
            <span className="original-annotation">
              No annotations yet, start recording to begin annotation and translation.
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default App;
