var context;

var masteries = {
    'bard' : 5,
    'braum' : 3,
    'hecarim' : 0,
    'janna' : 1,
    'lulu' : 3,
    'malphite' : 5,
    'masteryi' : 0,
    'nami' : 5,
    'nunu' : 0,
    'rammus' : 0,
    'rengar' : 1,
    'sona' : 4,
    'soraka' : 0,
    'tahmkench' : 5,
    'talon' : 4,
    'taric' : 1,
    'thresh' : 3,
    'zed' : 5,
    'zilean' : 0
}

const MAX_GAIN = 3;
const BASICALLY_ZERO = 0.001; // Used when dropping gain to basically zero, since we can't exponentially drop to zero.

const BEATS_PER_BAR = 4; // We're sticking with 4/4 time to start with.
const BEATS_PER_MINUTE = 200 + 1.5 * (masteries['hecarim'] + masteries['masteryi'] + masteries['rammus'] + masteries['zilean']);
const SECONDS_PER_BEAT = 60.0 / BEATS_PER_MINUTE;
const SECONDS_PER_BAR = BEATS_PER_BAR * SECONDS_PER_BEAT;

var songStartTime = 2;

window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch(e) {
        alert('Your browser does not support Urf Tunes; we recommend using Google Chrome.');
    }
};

function playFrequency(frequency, startTime, duration) {
    startTime = startTime || 0;
    
    var oscillator = context.createOscillator();
    var gain = this.context.createGain();
    gain.gain.setValueAtTime(0.25, 0);
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    if (duration)
        oscillator.stop(startTime + duration);
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
    this.gain.gain.setValueAtTime(0.8, time);
    
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

// Organ

function Organ(context, r1, r2, r3, r4, r5, r6, i1, i2, i3, i4, i5, i6) {
    this.context = context;
    
    var real = new Float32Array(7);
    var imag = new Float32Array(7);
    
    real[0] = 0;
    real[1] = r1;
    real[2] = r2;
    real[3] = r3;
    real[4] = r4;
    real[5] = r5;
    real[6] = r6;
    
    imag[0] = 0;
    imag[1] = i1;
    imag[2] = i2;
    imag[3] = i3;
    imag[4] = i4;
    imag[5] = i5;
    imag[6] = i6;
    
    this.waveform = this.context.createPeriodicWave(real, imag, {disableNormalization: false});
}

Organ.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.setPeriodicWave(this.waveform);
    
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
};

Organ.prototype.play = function(bars, pitch) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var attackEndTime = time + 2;
    var reduceEndTime = attackEndTime + 0;
    var fallOffTime = reduceEndTime + 1;
    var endTime = fallOffTime + 1;
    
    this.oscillator.frequency.setValueAtTime(pitch, time);
    
    this.gain.gain.setValueAtTime(0, time);
    this.gain.gain.linearRampToValueAtTime(0.1, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(0.1, reduceEndTime);
    this.gain.gain.setValueAtTime(0.1, fallOffTime);
    this.gain.gain.linearRampToValueAtTime(0, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

const A4 = 440;

const Gs4 = A4 * Math.pow(2, -1/12);
const G4 = A4 * Math.pow(2, -2/12);
const Fs4 = A4 * Math.pow(2, -3/12);
const F4 = A4 * Math.pow(2, -4/12);
const E4 = A4 * Math.pow(2, -5/12);
const Ds4 = A4 * Math.pow(2, -6/12);
const D4 = A4 * Math.pow(2, -7/12);
const Cs4 = A4 * Math.pow(2, -8/12);
const C4 = A4 * Math.pow(2, -9/12);
const B3 = A4 * Math.pow(2, -10/12);

const D5 = A4 * Math.pow(2, 5/12);
const Cs5 = A4 * Math.pow(2, 4/12);
const C5 = A4 * Math.pow(2, 3/12);
const B4 = A4 * Math.pow(2, 2/12);
const As4 = A4 * Math.pow(2, 1/12);

function playSong() {
    songStartTime = context.currentTime;
    
    // Create the instruments for the song.
    var bassDrum = new BassDrum(context, 150 + 20 * masteries['braum'], 0.1 + 0.1 * masteries['malphite']);
    var snareDrum = new SnareDrum(context, 100, 0.1 + 0.03 * masteries['rengar'],
            0.2 + 0.03 * masteries['talon'], 1500 - 200 * masteries['zed']);
    var suppOrgan = new Organ(context, 1 - 0.4 * masteries['bard'], 1 - 0.4 * masteries['braum'], -1 + 0.4 * masteries['janna'], -1 + 0.4 * masteries['lulu'], -1 + 0.4 * masteries['nami'], 1 - 0.4 * masteries['nunu'],
                                       -1 + 0.4 * masteries['sona'], -1 + 0.4 * masteries['soraka'], 1 - 0.4 * masteries['tahmkench'], 1 - 0.4 * masteries['taric'], 1 - 0.4 * masteries['thresh'], 1 - 0.4 * masteries['zilean']);
    
    // Megalovania
    suppOrgan.play(0, D4);
    suppOrgan.play(0, A4);
    //suppOrgan.play(1/16, D4);
    //suppOrgan.play(1/16, A4);
    //suppOrgan.play(1/8, D5);
    //suppOrgan.play(1/4, A4);
    //suppOrgan.play(7/16, Gs4);
    //suppOrgan.play(9/16, G4);
    //suppOrgan.play(11/16, F4);
    //suppOrgan.play(13/16, D4);
    //suppOrgan.play(14/16, F4);
    //suppOrgan.play(15/16, G4);
    
    suppOrgan.play(1+0, C4);
    suppOrgan.play(1+0, G4);
    //suppOrgan.play(1+1/16, C4);
    //suppOrgan.play(1+1/16, G4);
    //suppOrgan.play(1+1/8, D5);
    //suppOrgan.play(1+1/4, A4);
    //suppOrgan.play(1+7/16, Gs4);
    //suppOrgan.play(1+9/16, G4);
    //suppOrgan.play(1+11/16, F4);
    //suppOrgan.play(1+13/16, D4);
    //suppOrgan.play(1+14/16, F4);
    //suppOrgan.play(1+15/16, G4);
    
    suppOrgan.play(2+0, B3);
    suppOrgan.play(2+0, Fs4);
    //suppOrgan.play(2+1/16, B3);
    //suppOrgan.play(2+1/16, Fs4);
    //suppOrgan.play(2+1/8, D5);
    //suppOrgan.play(2+1/4, A4);
    //suppOrgan.play(2+7/16, Gs4);
    //suppOrgan.play(2+9/16, G4);
    //suppOrgan.play(2+11/16, F4);
    //suppOrgan.play(2+13/16, D4);
    //suppOrgan.play(2+14/16, F4);
    //suppOrgan.play(2+15/16, G4);
    
    bassDrum.play(0);
    bassDrum.play(1/16);
    snareDrum.play(2/16);
    bassDrum.play(3/16);
    snareDrum.play(4/16);
    snareDrum.play(6/16);
    snareDrum.play(8/16);
    
    bassDrum.play(1+0);
    bassDrum.play(1+1/16);
    snareDrum.play(1+2/16);
    bassDrum.play(1+3/16);
    snareDrum.play(1+4/16);
    snareDrum.play(1+6/16);
    snareDrum.play(1+8/16);
    
    bassDrum.play(2+0);
    bassDrum.play(2+1/16);
    snareDrum.play(2+2/16);
    bassDrum.play(2+3/16);
    snareDrum.play(2+4/16);
    snareDrum.play(2+6/16);
    snareDrum.play(2+8/16);
    
    

    // Increasing speed drum pattern
    /*var delta = 0.25;
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
    }*/
};