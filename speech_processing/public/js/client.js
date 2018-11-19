'use strict'

//connection to socket
const socket = io.connect();


// ================ CONFIG ================
let bufferSize = 2048,
  AudioContext, context, processor, input, globalStream;

let audioElement = document.querySelector('audio'),
  finalWord = false,
  resultText = document.getElementById('ResultText'),
  removeLastSentence = true,
  streamStreaming = false;


// Google Cloud audioStream constraints
const constraints = {
  audio: true,
  video: false
};



// ================ RECORDING ================
function initRecording() {
  socket.emit('startGoogleCloudStream', ''); //init socket Google Speech Connection
  streamStreaming = true;
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

  navigator.mediaDevices.getUserMedia(constraints)
    .then(handleSuccess);

}

function microphoneProcess(e) {
  var left = e.inputBuffer.getChannelData(0);
  // var left16 = convertFloat32ToInt16(left); // old 32 to 16 function
  var left16 = downsampleBuffer(left, 44100, 16000)
  socket.emit('binaryData', left16);
}



// ================ INTERFACE ================
var startButton = document.getElementById("startRecButton");
startButton.addEventListener("click", startRecording);

var endButton = document.getElementById("stopRecButton");
endButton.addEventListener("click", stopRecording);
endButton.disabled = true;

var recordingStatus = document.getElementById("recordingStatus");

function startRecording() {
  startButton.disabled = true;
  endButton.disabled = false;
  recordingStatus.style.visibility = "visible";
  initRecording();
}

function stopRecording() {
  // waited for FinalWord
  startButton.disabled = false;
  endButton.disabled = true;
  recordingStatus.style.visibility = "hidden";
  streamStreaming = false;
  socket.emit('endGoogleCloudStream', '');

  let track = globalStream.getTracks()[0];
  track.stop();

  input.disconnect(processor);
  processor.disconnect(context.destination);

  context.close().then(function() {
    input = null, processor = null, context = null, AudioContext = null;
    startButton.disabled = false;
  });
}



// ================ SOCKET.IO CLIENT ================
socket.on('connect', function(data) {
  socket.emit('join', 'Server Connected to Client');
});


socket.on('messages', function(data) {
  console.log(data);
});


socket.on('speechData', function(data) {
  var dataFinal = undefined || data.results[0].isFinal;

  if (dataFinal === false) {
    if (removeLastSentence) {
      resultText.lastElementChild.remove();
    }
    removeLastSentence = true;

    // Create container span
    let empty = document.createElement('span');
    resultText.appendChild(empty);

    // Add children to empty span
    let edit = addTimeSettings(data, false);

    for (let i = 0; i < edit.length; i++) {
      resultText.lastElementChild.appendChild(edit[i]);
      resultText.lastElementChild.appendChild(document.createTextNode('\u00A0'));
    }

  } else if (dataFinal === true) {
    resultText.lastElementChild.remove();

    // Create container span
    let empty = document.createElement('span');
    resultText.appendChild(empty);

    // Add children to empty span
    let edit = addTimeSettings(data, true);
    for (let i = 0; i < edit.length; i++) {
      resultText.lastElementChild.appendChild(edit[i]);

      if (i !== edit.length - 1) {
        resultText.lastElementChild.appendChild(document.createTextNode('\u00A0'));
      }
    }
    resultText.lastElementChild.appendChild(document.createTextNode('\u002E\u00A0'));

    console.log("Google Speech sent 'final' Sentence.");
    finalWord = true;
    endButton.disabled = false;
    removeLastSentence = false;
  }
});



// ================ FORMAT GCLOUD RESPONSE ================
function addTimeSettings(speechData, isFinal) {
  let wholeString = speechData.results[0].alternatives[0].transcript;
  let words;
	// Data is formatted differently when it is the end of the sentence
	//	 versus interim results
  if (isFinal) {
    words = speechData.results[0].alternatives[0].words
  } else {
    words = speechData.results[0].alternatives[0].transcript.split(" ")
              .map((word) => { return {word: word} });
  }

  let words_with_time = [];

  for (let i = 0; i < words.length; i++) {
    // Generate span
    let newSpan = document.createElement('span');

		let word = words[i].word;
		if (i === 0) { word = capitalize(word);}

    if (isFinal) {
      newSpan.dataset.startTime = `${words[i].startTime.seconds}.${words[i].startTime.nanos}`;
    }

    newSpan.innerHTML = word;
    words_with_time.push(newSpan);
  }
  return words_with_time;
}

window.onbeforeunload = function() {
  if (streamStreaming) {
    socket.emit('endGoogleCloudStream', '');
  }
};



// ================ HELPERS ================
// sampleRateHertz 16000
function convertFloat32ToInt16(buffer) {
  let l = buffer.length;
  let buf = new Int16Array(l / 3);

  while (l--) {
    if (l % 3 == 0) {
      buf[l / 3] = buffer[l] * 0xFFFF;
    }
  }
  return buf.buffer
}

var downsampleBuffer = function(buffer, sampleRate, outSampleRate) {
  if (outSampleRate >= sampleRate) {
    throw "downsampling rate should be smaller than original sample rate";
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

function capitalize(s) {
  if (s.length < 1) {
    return s;
  } return s.charAt(0).toUpperCase() + s.slice(1);
}
