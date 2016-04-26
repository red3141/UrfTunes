var context;
window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch(e) {
        alert('Your browser does not support Urf Tunes; we recommend using Google Chrome.');
    }
}

function playFrequency(frequency) {
    var oscillator = context.createOscillator();
    oscillator.frequency.value = frequency;
    var i = 0;
    setInterval(function() { oscillator.frequency.value += 50 * Math.sin(i); i += 0.3;}, 100);
    oscillator.connect(context.destination);
    oscillator.start(0);
}

var bassDrumOscillator;
var bassDrumGain;

function playBassDrum() {
    if (!bassDrumOscillator) {
        bassDrumOscillator = context.createOscillator();
        bassDrumGain = context.createGain();
        bassDrumGain.gain.value = 0;
        bassDrumOscillator.connect(bassDrumGain);
        bassDrumGain.connect(context.destination);
        bassDrumOscillator.start(now);
    }
    
    var now = context.currentTime;
    var duration = 3;
    
    bassDrumGain.gain.cancelScheduledValues(0);
    // Reduce the gain to 0 to avoid a clicking noise when starting the bass drum sound again.
    bassDrumGain.gain.setValueAtTime(0, now);
    bassDrumGain.gain.setValueAtTime(1, now + 0.001);
    bassDrumGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    bassDrumGain.gain.setValueAtTime(0, now + duration);
    
    bassDrumOscillator.frequency.setValueAtTime(150, now);
    bassDrumOscillator.frequency.exponentialRampToValueAtTime(0.001, now + duration);
}