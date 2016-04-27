var context;
const MAX_GAIN = 3;

window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch(e) {
        alert('Your browser does not support Urf Tunes; we recommend using Google Chrome.');
    }
};

function playFrequency(frequency) {
    var oscillator = context.createOscillator();
    oscillator.frequency.value = frequency;
    var i = 0;
    setInterval(function() { oscillator.frequency.value += 50 * Math.sin(i); i += 0.3;}, 100);
    oscillator.connect(context.destination);
    oscillator.start(0);
};

// Bass Drum
function BassDrum(context, pitch, duration) {
    this.context = context;
    this.pitch = pitch;
    this.duration = duration;
};

BassDrum.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
};

BassDrum.prototype.setPitch = function(newPitch) {
    this.pitch = newPitch;
};

BassDrum.prototype.setDuration = function(newDuration) {
    this.duration = newDuration;
};

BassDrum.prototype.play = function(time, volume) {
    this.init();
    
    var endTime = time + this.duration;
    
    this.oscillator.frequency.setValueAtTime(this.pitch, time);
    this.gain.gain.setValueAtTime(MAX_GAIN * volume, time);
    
    this.oscillator.frequency.exponentialRampToValueAtTime(0.001, endTime);
    this.gain.gain.exponentialRampToValueAtTime(0.001, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

function playMeSomeSweetSweetBassDrum() {
    var bassDrum = new BassDrum(context, 150, 0.6);
    var now = context.currentTime;
    bassDrum.play(now, 1);
    bassDrum.play(now + 1, 0.25);
    bassDrum.play(now + 2, 0.5);
    bassDrum.play(now + 3, 0.25);
    bassDrum.play(now + 4, 1);
    bassDrum.play(now + 5, 0.25);
};