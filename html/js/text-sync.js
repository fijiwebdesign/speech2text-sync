// Global Variables for Audio
let audioContext;
let audioBuffer;
let sourceNode;
let analyserNode;
let javascriptNode;
let audioData = null;
let audioPlaying = false;
let sampleSize = 256;  // number of samples to collect before analyzing data
let amplitudeArray;     // array to hold time domain data
// This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
let audioUrl = "audio/quote.webm";
// Global variables for the Graphics
let canvasWidth  = 512;
let canvasHeight = 256;

// When the Start button is clicked, finish setting up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas
document.querySelector('#start_button').addEventListener('click', function(e) {
    // the AudioContext is the primary 'container' for all your audio node objects
    if(!audioContext) {
      try {
          audioContext = new AudioContext();
      } catch(e) {
          alert('Web Audio API is not supported in this browser');
      }
    }

    e.preventDefault();
    // Set up the audio Analyser, the Source Buffer and javascriptNode
    setupAudioNodes();

    // Load the Audio the first time through, otherwise play it from the buffer
    if(audioData == null) {
        loadSound(audioUrl);
    } else {
        playSound(audioData);
    }
});

// Stop the audio playing
document.querySelector('#stop_button').addEventListener('click', function(e) {
    e.preventDefault();
    sourceNode.stop(0);
    audioPlaying = false;
});


function setupAudioNodes() {
    sourceNode     = audioContext.createBufferSource();
    analyserNode   = audioContext.createAnalyser();
    //analyserNode.fftSize = sampleSize;
    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
}
// Load the audio from the URL via Ajax and store it in global variable audioData
// Note that the audio load is asynchronous
function loadSound(url) {
    document.getElementById('msg').textContent = "Loading audio...";
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // When loaded, decode the data and play the sound
    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            document.getElementById('msg').textContent = "Audio sample download finished";
            audioData = buffer;
            playSound(audioData);
        }, onError);
    }
    request.send();
}

// Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);    // Play the sound now
    sourceNode.loop = false;
    audioPlaying = true;

    setTimeout(() => audioPlaying = false, 5000)
    
    drawTimeDomain()
}

function onError(e) {
    console.log(e);
}

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  document.querySelector('#canvases').appendChild(canvas);
  return canvas
}

let ampHistory = [];

let canvas;
const wordsEl = document.querySelector('#words')
const wordsAudioEl = document.querySelector('#words-audio')
const words = wordsEl.innerText.split(' ')

function drawTimeDomain() {

  if (!audioPlaying) return

  requestAnimationFrame(drawTimeDomain)

  //analyserNode.getByteTimeDomainData(amplitudeArray);
  analyserNode.getByteFrequencyData(amplitudeArray);

  if (!canvas) canvas = createCanvas();
  ctx = canvas.getContext('2d');
  
  ctx.beginPath();
  let totalAmp = 0;
  const len = amplitudeArray.length
  for (let i = 0; i < len; i++) {
      const y = amplitudeArray[i];
      let value = y / 256;
      let n = canvasHeight - (canvasHeight * value);
      if (i === 0) {
        ctx.moveTo(i, n);
      } else {
        ctx.lineTo(i, n);
      }
      totalAmp += y;
  }
  ctx.strokeStyle = '#000';
  ctx.stroke();


  const max = amplitudeArray.reduce((max, curr) => curr > max ? curr : max, 0)
  const min = amplitudeArray.reduce((min, curr) => curr < min ? curr : min, 0)
  const range = amplitudeArray.reduce((num, curr) => curr > 0 ? num+1 : num, 0)
  const time = sourceNode.currentTime
  const avg = Math.round(totalAmp/range)
  console.log('stats', { totalAmp, avg, max, min, range, time })
  ampHistory.push(totalAmp)

}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}