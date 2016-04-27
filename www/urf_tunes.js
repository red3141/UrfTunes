var context;

var masteries = {
    'braum' : 5,
    'hecarim' : 5,
    'malphite' : 5,
    'masteryi' : 5,
    'rammus' : 5,
    'rengar' : 1,
    'talon' : 4,
    'zed' : 5,
    'zilean' : 5
}

const MAX_GAIN = 3;
const BASICALLY_ZERO = 0.001; // Used when dropping gain to basically zero, since we can't exponentially drop to zero.

const BEATS_PER_BAR = 4; // We're sticking with 4/4 time to start with.
const BEATS_PER_MINUTE = 110 + 1.5 * (masteries['hecarim'] + masteries['masteryi'] + masteries['rammus'] + masteries['zilean']);
const SECONDS_PER_BEAT = 60.0 / BEATS_PER_MINUTE;
const SECONDS_PER_BAR = BEATS_PER_BAR * SECONDS_PER_BEAT;

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

BassDrum.prototype.play = function(bars) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var endTime = time + this.duration;
    
    this.oscillator.frequency.setValueAtTime(this.pitch, time);
    this.gain.gain.setValueAtTime(MAX_GAIN, time);
    
    this.oscillator.frequency.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

// Snare Drum
function SnareDrum(context, pitch, oscillatorDuration, noiseDuration, filterMinPitch) {
    this.context = context;
    this.noiseBuffer = this.createNoiseBuffer();
    this.pitch = pitch;
    this.oscillatorDuration = oscillatorDuration;
    this.noiseDuration = noiseDuration;
    this.filterMinPitch = filterMinPitch;
}

SnareDrum.prototype.createNoiseBuffer = function() {
    var bufferSize = this.context.sampleRate;
    var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    var output = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; ++i) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
};

SnareDrum.prototype.init = function() {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer;
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = this.filterMinPitch;
    this.noise.connect(noiseFilter);
    this.noiseGain = this.context.createGain();
    noiseFilter.connect(this.noiseGain);
    
    this.noiseGain.connect(this.context.destination);
    
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    
    this.oscillatorGain = this.context.createGain();
    this.oscillator.connect(this.oscillatorGain);
    this.oscillatorGain.connect(this.context.destination);
};

SnareDrum.prototype.setPitch = function(newPitch) {
    this.pitch = newPitch;
}

SnareDrum.prototype.setOscillatorDuration = function(newOscillatorDuration) {
    this.oscillatorDuration = newOscillatorDuration;
}

SnareDrum.prototype.setNoiseDuration = function(newNoiseDuration) {
    this.noiseDuration = newNoiseDuration;
}

SnareDrum.prototype.setFilterMinPitch = function(newFilterMinPitch) {
    this.filterMinPitch = filterMinPitch;
}

SnareDrum.prototype.play = function(bars) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var oscillatorEndTime = time + this.oscillatorDuration;
    var noiseEndTime = time + this.noiseDuration;
    var endTime = Math.max(oscillatorEndTime, noiseEndTime);
    
    this.noiseGain.gain.setValueAtTime(MAX_GAIN * 0.3, time);
    this.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, noiseEndTime);
    this.noise.start(time);
    
    this.oscillator.frequency.setValueAtTime(this.pitch, time);
    this.oscillatorGain.gain.setValueAtTime(MAX_GAIN * 0.3, time);
    this.oscillatorGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, oscillatorEndTime);
    this.oscillator.start(time);
    
    this.noise.stop(endTime);
    this.oscillator.stop(endTime);
}

function playSong() {
    songStartTime = context.currentTime;
    
    // Create the instruments for the song.
    var bassDrum = new BassDrum(context, 150 + 20 * masteries['braum'], 0.1 + 0.1 * masteries['malphite']);
    var snareDrum = new SnareDrum(context, 100, 0.1 + 0.03 * masteries['rengar'],
            0.2 + 0.03 * masteries['talon'], 1500 - 200 * masteries['zed']);
    
    var delta = 0.25;
    var repeats = 4;
    var bars = 0;
    
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < repeats; ++j) {
            snareDrum.play(bars);
            if (j % 2 == 0) {
                bassDrum.play(bars, 1);
            }
            bars += delta;
            if (j == 24) break;
        }
        delta /= 2;
        repeats *= 2;
    }
};