// Global Variables for Audio
let audioContext;
let audioBuffer;
let sourceNode;
let gainNode;
let analyserNode;
let audioPlaying = false;
let sampleSize = 256;  // number of samples to collect before analyzing data
let amplitudeArray;     // array to hold time domain data
// This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
let audioUrl = "audio/quote.webm";
// Global variables for the Graphics
let canvasWidth  = 1000;
let canvasHeight = 800;
let audio = null;

// When the Start button is clicked, finish setting up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas
document.querySelector('#start_button').addEventListener('click', function(e) {
    // the AudioContext is the primary 'container' for all your audio node objects
    if(!audioContext) {
      try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
          alert('Web Audio API is not supported in this browser');
      }
    }

    e.preventDefault();

    // Load the Audio the first time through, otherwise play it from the buffer
    if(audio == null) {
        loadSound(audioUrl);
    } else {
        playSound(audio);
    }
});

// Stop the audio playing
document.querySelector('#stop_button').addEventListener('click', function(e) {
    e.preventDefault();
    audio.pause();
    audio.currentTime = 0
    audioPlaying = false;
});


function setupAudioNodes(stream) {
    sourceNode = audioContext.createMediaStreamSource(stream);
    analyserNode   = audioContext.createAnalyser();
    gainNode = audioContext.createGain();
    //analyserNode.fftSize = sampleSize;
    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    gainNode.gain.value = 1
}
// Load the audio from the URL via Ajax and store it in global variable audioData
// Note that the audio load is asynchronous
function loadSound(url) {

  audio = new Audio(url);

  document.getElementById('msg').textContent = "Loading audio...";

  audio.addEventListener("canplaythrough", () => {
    const stream = audio.captureStream();
    setupAudioNodes(stream);
    playSound(audio);
  });
  audio.addEventListener("timeupdate", () => {
    console.log('time', { time: audio.currentTime, duration: audio.duration })
  });
  audio.addEventListener("ended", () => {
    window.cancelAnimationFrame(drawCanvas);
    audioPlaying = false
    canvasDone()
  });

  audioContext.onstatechange = function() {
    console.log(audioContext.state);
  }

}

// Play the audio and loop until stopped
function playSound(audio) {
    //audio.playbackRate = 2
    //audio.volume = 0
    // @todo try gain node = 0
    audio.play();
    audioPlaying = true;

    drawCanvas();
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

let canvas;
const wordsEl = document.querySelector('#words')
const wordsAudioEl = document.querySelector('#words-audio')
const words = wordsEl.innerText.split(' ')

if (!canvas) canvas = createCanvas();
ctx = canvas.getContext('2d');

let x = 0;

let values = [];

function drawCanvas() {

  if (!audioPlaying) return

  requestAnimationFrame(drawCanvas)

  //analyserNode.getByteTimeDomainData(amplitudeArray);
  analyserNode.getByteFrequencyData(amplitudeArray);
  
  let totalAmp = 0;
  const len = amplitudeArray.length
  for (let i = 0; i < len; i++) {
      const y = amplitudeArray[i];
      let value = y / 256;
      let n = canvasHeight - (canvasHeight * value);
      // if (i === 0) {
      //   ctx.moveTo(i, n);
      // } else {
      //   ctx.lineTo(i, n);
      // }
      totalAmp += y;
  }
  
  const max = amplitudeArray.reduce((max, curr) => curr > max ? curr : max, 0)
  const min = amplitudeArray.reduce((min, curr) => curr < min ? curr : min, 0)
  const range = amplitudeArray.reduce((num, curr) => curr > 0 ? num+1 : num, 0)
  const time = audio.currentTime
  const avg = Math.round(totalAmp/range)
  const ts = sourceNode.context.getOutputTimestamp()
  //console.log('stats', { x, ts, totalAmp, avg, max, min, range, time })

  addLinePoint(x, max)
  values.push(max);
  
  x++;
}

function addLinePoint(x, y) {
  if (x === 0) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }
}

function canvasDone() {
  ctx.strokeStyle = '#000';
  ctx.stroke();

  const peaks = smoothed_z_score(values, {
    lag: 10,
    threshold: 1,
    influence: 0.5
  })
  console.log('values', values);
  console.log('peaks', peaks);

  ctx.beginPath();
  peaks.forEach((peak, i) => {
    if (peak === 1) {
      if (peaks[i-1] === 0) {
        ctx.beginPath();
      } else if (peaks[i+1] === 0) {
        ctx.strokeStyle = 'red';
        ctx.stroke();
      }
      ctx.lineTo(i, values[i] + 300);
    }
  })

  ctx.beginPath();
  peaks.forEach((peak, i) => {
    if (peak === -1) {
      if (peaks[i-1] === 0) {
        ctx.beginPath();
      } else if (peaks[i+1] === 0) {
        ctx.strokeStyle = 'blue';
        ctx.stroke();
      }
      ctx.lineTo(i, values[i] + 300);
    }
  })

  ctx.beginPath();
  peaks.forEach((peak, i) => {
    if (peak === 0) {
      if (peaks[i-1] !== 0) {
        ctx.beginPath();
      } else if (peaks[i+1] !== 0) {
        ctx.strokeStyle = 'green';
        ctx.stroke();
      }
      ctx.lineTo(i, values[i] + 300);
    }
  })


}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}