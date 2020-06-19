import React from 'react';
import Button from 'react-bootstrap/Button';

function StartButton(props) {
  return (
    <div id="start-rec-button-box">
      <Button
        variant="primary"
        size="lg"
        block
        disabled={props.isActive}
        onClick={props.startRecording}
      >
        Start Recording
      </Button>
    </div>
  );
}

function StopButton(props) {
  return (
    <div id="stop-rec-button-box">
      <Button
        variant="secondary"
        size="lg"
        block
        disabled={!props.isActive}
        onClick={props.stopRecording}
      >
        Stop Recording
      </Button>
    </div>
  );
}

export {
  StartButton,
  StopButton
};
