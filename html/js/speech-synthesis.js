
var inputForm = document.querySelector('#inputForm');
var inputText = document.querySelector('#inputText');
var voiceSelect = document.querySelector('#voiceSelect');

populateVoiceList();

inputForm.onsubmit = function(event) {
  event.preventDefault();

  var selectedOption = voiceSelect.selectedOptions[0];
  var selectedName = selectedOption ? selectedOption.getAttribute('data-name') : null;
  var voice;

  var voices = speechSynthesis.getVoices();

  for(i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedName) {
      voice = voices[i];
    }
  }
  speak(inputText.value, voice);
  inputText.blur();
}

function speak(text, voice) {
  var utterThis = new SpeechSynthesisUtterance(text);
  if (voice) utterThis.voice = voice;
  speechSynthesis.speak(utterThis);
}

function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  var voices = speechSynthesis.getVoices();

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voiceSelect").appendChild(option);
  }
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}