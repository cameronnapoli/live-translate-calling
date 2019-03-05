import React from 'react';

function StartButton(props) {
  return (
    <div id="start-rec-button-box">
      <button id="start-rec-button" type="button"> Start recording</button>
    </div>
  );
}

function StopButton(props) {
  return (
    <div id="stop-rec-button-box">
      <button id="stop-rec-button" type="button" disabled> Stop recording</button>
    </div>
  );
}

export {
	StartButton,
	StopButton
};