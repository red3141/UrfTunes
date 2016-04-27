var context;

var masteries = {
    'braum' : 5,
    'hecarim' : 0,
    'malphite' : 5,
    'masteryi' : 0,
    'rammus' : 0,
    'zilean' : 0
}

const MAX_GAIN = 3;
const BEATS_PER_BAR = 4; // We're sticking with 4/4 time to start with.
const BEATS_PER_MINUTE = 110 + 40 + 2 * (masteries['hecarim'] + masteries['masteryi'] + masteries['rammus'] + masteries['zilean']);
const SECONDS_PER_BEAT = 60.0 / BEATS_PER_MINUTE;
const SECONDS_PER_BAR = BEATS_PER_BAR * SECONDS_PER_BEAT;
console.log(SECONDS_PER_BEAT + "   " + SECONDS_PER_BAR);

var songStartTime = 0;

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

BassDrum.prototype.play = function(bars, volume) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var endTime = time + this.duration;
    
    this.oscillator.frequency.setValueAtTime(this.pitch, time);
    this.gain.gain.setValueAtTime(MAX_GAIN * volume, time);
    
    this.oscillator.frequency.exponentialRampToValueAtTime(0.001, endTime);
    this.gain.gain.exponentialRampToValueAtTime(0.001, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

function playSong() {
    songStartTime = context.currentTime;
    
    // Create the instruments for the song.
    var bassDrum = new BassDrum(context, 150 + 20 * masteries['braum'], 0.1 + 0.1 * masteries['malphite']);
    
    var delta = 0.25;
    var repeats = 4;
    var bars = 0;
    
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < repeats; ++j) {
            bassDrum.play(bars, 1);
            bars += delta;
        }
        delta /= 2;
        repeats *= 2;
    }
};