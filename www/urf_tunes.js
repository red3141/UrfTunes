const MAX_GAIN = 3;
const BASICALLY_ZERO = 0.001; // Used when dropping gain to basically zero, since we can't exponentially drop to zero.

window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
    } catch(e) {
        alert('Your browser does not support Urf Tunes; we recommend using Google Chrome.');
    }
};

// Bass Drum
function BassDrum(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    this.pitch = 150;
    this.duration = 0.1;
};

BassDrum.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.analyzer);
};

BassDrum.prototype.play = function(startTime) {
    this.init();
    
    var endTime = startTime + this.duration;
    
    this.oscillator.frequency.setValueAtTime(this.pitch, startTime);
    this.oscillator.frequency.setValueAtTime(this.pitch, startTime + 0.01);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
    this.gain.gain.exponentialRampToValueAtTime(2, startTime + 0.01);
    this.oscillator.frequency.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(startTime);
    this.oscillator.stop(endTime);
};

// Snare Drum
function SnareDrum(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    this.noiseBuffer = this.createNoiseBuffer();
    this.pitch = 100;
    this.oscillatorDuration = 0.1;
    this.noiseDuration = 0.2;
    this.filterMinPitch = 1500;
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
    
    this.noiseGain.connect(this.analyzer);
    
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    
    this.oscillatorGain = this.context.createGain();
    this.oscillator.connect(this.oscillatorGain);
    this.oscillatorGain.connect(this.analyzer);
};

SnareDrum.prototype.play = function(startTime) {
    this.init();
    
    var oscillatorEndTime = startTime + this.oscillatorDuration;
    var noiseEndTime = startTime + this.noiseDuration;
    var endTime = Math.max(oscillatorEndTime, noiseEndTime);
    
    var volume = 0.3;
    this.noiseGain.gain.setValueAtTime(volume, startTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, noiseEndTime);
    this.noise.start(startTime);
    
    this.oscillator.frequency.setValueAtTime(this.pitch, startTime);
    this.oscillatorGain.gain.setValueAtTime(volume, startTime);
    this.oscillatorGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, oscillatorEndTime);
    this.oscillator.start(startTime);
    
    this.noise.stop(endTime);
    this.oscillator.stop(endTime);
}

// SineTooth
// Build a wave from 26 (= 130/5) of the champion mastery levels. 26 was chosen due to restrictions
// in how many harmonics can be using the AnalyserNode at normal pitches.
// Note: this is pretty reliant on there being exactly 130 champions right now. RIP Taliyah.

function SineTooth(context, analyzer, mode) {
    this.context = context;
    this.analyzer = analyzer;
    
    const NUMBER_OF_MODES = 5;
    const CHAMPS_PER_MODE = championNames.length / NUMBER_OF_MODES;
    mode %= NUMBER_OF_MODES;
    
    var length = CHAMPS_PER_MODE + 2;
    var real = new Float32Array(length);
    var imag = new Float32Array(length);
    
    // Build on top of a pure sine wave
    real[0] = 0;
    imag[0] = 0;
    real[1] = 0;
    imag[1] = 1;
    var power, championName;
    for (var i = 2; i < CHAMPS_PER_MODE; ++i) {
        championName = championNames[i - 2 + (mode * CHAMPS_PER_MODE)];
        power = masteries[championName];
        power /= 5.0;
        imag[i] = power;
        real[i] = 0;
    }
    
    this.waveform = this.context.createPeriodicWave(real, imag);
}

SineTooth.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.setPeriodicWave(this.waveform);
    
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.analyzer);
};

SineTooth.prototype.play = function(startTime, pitch, duration) {
    this.init();
    
    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, startTime + duration);
    var endTime = fallOffTime + 0.01;
    
    this.oscillator.frequency.setValueAtTime(pitch, startTime);
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
    this.gain.gain.linearRampToValueAtTime(0.3, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(0.15, reduceEndTime);
    this.gain.gain.setValueAtTime(0.15, fallOffTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(startTime);
    this.oscillator.stop(endTime);
};

// Trumpet

function Trumpet(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    
    var length = 9;
    var real = new Float32Array(length);
    var imag = new Float32Array(length);
    
    // Build on top of a pure sine wave
    real[0] = 0;
    imag[0] = 0;
    for (var i = 1; i < length; ++i) {
        real[i] = 1;
        imag[i] = 0;
    }
    
    this.waveform = this.context.createPeriodicWave(real, imag);
}

Trumpet.prototype.init = function() {
    this.oscillator1 = this.context.createOscillator();
    this.oscillator1.setPeriodicWave(this.waveform);
    this.oscillator2 = this.context.createOscillator();
    this.oscillator2.setPeriodicWave(this.waveform);
 
    this.gain = this.context.createGain();
    this.oscillator1.connect(this.gain);
    this.oscillator2.connect(this.gain);
    
    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 2000;
    
    this.gain.connect(this.filter);
    this.filter.connect(this.analyzer);
};

Trumpet.prototype.play = function(startTime, pitch, duration) {
    this.init();

    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, startTime + duration);
    var endTime = fallOffTime + 0.01;
    
    this.oscillator1.frequency.setValueAtTime(pitch, startTime);
    this.oscillator1.detune.value = 10;
    this.oscillator2.frequency.setValueAtTime(pitch, startTime);
    this.oscillator2.detune.value = -10;
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
    this.gain.gain.linearRampToValueAtTime(0.4, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(0.2, reduceEndTime);
    this.gain.gain.exponentialRampToValueAtTime(0.4, fallOffTime);
    this.gain.gain.linearRampToValueAtTime(0, endTime);
    
    this.oscillator1.start(startTime);
    this.oscillator1.stop(endTime);
    this.oscillator2.start(startTime);
    this.oscillator2.stop(endTime);
};

// Bass
// If you use this instrument for non-low notes, you're gonna have a bad time :sans:

function Bass(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
}

Bass.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
 
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    
    this.gain.connect(this.analyzer);
};

Bass.prototype.play = function(startTime, pitch, duration) {
    this.init();
        
    var attackGain = 0.9;
    var reduceGain = 0.5;
    var maxDurationSeconds = 3.0;

    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, Math.min(reduceEndTime + maxDurationSeconds, startTime + duration));
    var endTime = fallOffTime + 0.01;
    
    this.oscillator.frequency.setValueAtTime(pitch, startTime);
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
    this.gain.gain.linearRampToValueAtTime(attackGain, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(reduceGain, reduceEndTime);
    // The bass can't be "held," it will fall off over time no matter what
    this.gain.gain.exponentialRampToValueAtTime(
        reduceGain * (1 + BASICALLY_ZERO - ((fallOffTime - reduceEndTime) / maxDurationSeconds)),
        fallOffTime);
    this.gain.gain.linearRampToValueAtTime(0, endTime);
    
    this.oscillator.start(startTime);
    this.oscillator.stop(endTime);
};

// Slider

function Slider(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
}

Slider.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'sine';
 
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    
    this.gain.connect(this.analyzer);
};

Slider.prototype.play = function(startTime, fromPitch, toPitch, fromGain, toGain, duration) {
    this.init();

    // Ramp up/down at the beginning/end of being played to avoid clicks.
    var rampUpTime = 0.02;
    var rampDownTime = 0.02;
    var rampUpEndTime = startTime + rampUpTime;
    var holdTime = duration;
    holdTime = Math.max(holdTime, rampUpTime);
    var rampDownStartTime = startTime + holdTime;
    var endTime = rampDownStartTime + rampDownTime;
    
    this.oscillator.frequency.setValueAtTime(fromPitch, tstartTimeime);
    this.oscillator.frequency.linearRampToValueAtTime(toPitch, endTime);
    
    // Avoid errors if fromGain or toGain is 0
    fromGain = Math.max(fromGain, BASICALLY_ZERO);
    toGain = Math.max(toGain, BASICALLY_ZERO);
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
    this.gain.gain.exponentialRampToValueAtTime(fromGain, rampUpEndTime);
    this.gain.gain.linearRampToValueAtTime(toGain, rampDownStartTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(startTime);
    this.oscillator.stop(endTime);
};

function createNoiseBuffer(context) {
    var bufferSize = context.sampleRate;
    var buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    var output = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; ++i) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
};

// White noise with a filter

function WhiteNoiseWithFilter(context, analyzer) {
    this.baseConstructor(context, analyzer);
}

WhiteNoiseWithFilter.prototype.baseConstructor = function(context, analyzer) {
    if (!context || !analyzer)
        return;
    this.context = context;
    this.analyzer = analyzer;
    this.noiseBuffer = createNoiseBuffer(context);
}

WhiteNoiseWithFilter.prototype.baseInit = function() {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer;
    this.noise.loop = true;
    this.noiseFilter = this.context.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noise.connect(this.noiseFilter);
    this.noiseGain = this.context.createGain();
    this.noiseFilter.connect(this.noiseGain);
    
    this.noiseGain.connect(this.analyzer);
};
WhiteNoiseWithFilter.prototype.init = WhiteNoiseWithFilter.prototype.baseInit;

WhiteNoiseWithFilter.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var duration = options.duration || 1;
    var initialFrequency = options.initialFrequency || 440;
    var initialQ = options.initialQ || BASICALLY_ZERO;
    var finalFrequency = options.finalFrequency || initialFrequency;
    var finalQ = options.finalQ || initialQ;
    var volume = options.volume || 1;
    
    this.init();
    
    var rampUpStartTime = Math.max(startTime - 0.02, 0);
    var rampDownStartTime = startTime + duration - 0.02;
    var endTime = startTime + duration;
    
    this.noiseFilter.frequency.setValueAtTime(initialFrequency, startTime);
    this.noiseFilter.Q.setValueAtTime(initialQ, startTime);
    this.noiseFilter.frequency.exponentialRampToValueAtTime(finalFrequency, endTime);
    this.noiseFilter.Q.exponentialRampToValueAtTime(finalQ, endTime);
    
    this.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    this.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, rampUpStartTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(volume, startTime);
    this.noiseGain.gain.setValueAtTime(volume, rampDownStartTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.noise.start(rampUpStartTime);
    this.noise.stop(endTime);
};

function WhiteNoiseWithBandPass(context) {
    this.baseConstructor(context);
}
WhiteNoiseWithBandPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithBandPass.prototype.init = function() {
    this.baseInit();
    this.noiseFilter.type = 'bandpass';
};

function WhiteNoiseWithNotch(context) {
    this.baseConstructor(context);
}
WhiteNoiseWithNotch.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithNotch.prototype.init = function() {
    this.baseInit();
    this.noiseFilter.type = 'notch';
};

function WhiteNoiseWithLowPass(context) {
    this.baseConstructor(context);
}
WhiteNoiseWithLowPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithLowPass.prototype.init = function() {
    this.baseInit();
    this.noiseFilter.type = 'lowpass';
};

function WhiteNoiseWithHighPass(context) {
    this.baseConstructor(context);
}
WhiteNoiseWithHighPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithHighPass.prototype.init = function() {
    this.baseInit();
    this.noiseFilter.type = 'highpass';
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
const As3 = A4 * Math.pow(2, -11/12);

const D5 = A4 * Math.pow(2, 5/12);
const Cs5 = A4 * Math.pow(2, 4/12);
const C5 = A4 * Math.pow(2, 3/12);
const B4 = A4 * Math.pow(2, 2/12);
const As4 = A4 * Math.pow(2, 1/12);

const A3 = 220;
const A2 = 110;

const As2 = A2 * Math.pow(2, 1/12);
const B2 = A2 * Math.pow(2, 2/12);
const C3 = A2 * Math.pow(2, 3/12);
const Cs3 = A2 * Math.pow(2, 4/12);
const D3 = A2 * Math.pow(2, 5/12);

function doVisualization(analyzer) {
    const canvas = document.getElementById('visualizationArea');
    const canvasContext = canvas.getContext('2d');
    
    const draw = function() {
        canvasContext.canvas.width = Math.max(512, window.innerWidth);
        canvasContext.canvas.height = 256;
    
        width = canvas.width;
        height = canvas.height;
    
        analyzer.fftSize = 1024;
        var bufferLength = analyzer.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyzer.getByteFrequencyData(dataArray);
        
        canvasContext.fillStyle = 'rgb(9, 9, 9)';
        canvasContext.fillRect(0, 0, width, height);
        
        var barWidth = (width / bufferLength);
        var barHeight;
        var x = 0;
        
        for (var i = 0; i < bufferLength; ++i) {
            barHeight = dataArray[i];
            
            canvasContext.fillStyle = 'rgb(0,' + barHeight + ',' + (255 - barHeight) + ')';
            canvasContext.fillRect(x, height-barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }

        window.requestAnimationFrame(draw);
    };
    
    draw();
}

function playSong() {
    const BEATS_PER_BAR = 4; // We're sticking with 4/4 time to start with.
    const BEATS_PER_MINUTE = 80 + 1.5 * (masteries['hecarim'] + masteries['masteryi'] + masteries['rammus'] + masteries['zilean']);
    const SECONDS_PER_BEAT = 60.0 / BEATS_PER_MINUTE;
    const SECONDS_PER_BAR = BEATS_PER_BAR * SECONDS_PER_BEAT;

    const context = new AudioContext();
    const analyzer = context.createAnalyser();
    analyzer.connect(context.destination);
    
    doVisualization(analyzer);
    
    // Create the instruments for the song.
    var bassDrum = new BassDrum(context, analyzer);
    var snareDrum = new SnareDrum(context, analyzer);
    var sineTooth0 = new SineTooth(context, analyzer, 0);
    var sineTooth1 = new SineTooth(context, analyzer, 1);
    var sineTooth2 = new SineTooth(context, analyzer, 2);
    var sineTooth3 = new SineTooth(context, analyzer, 3);
    var sineTooth4 = new SineTooth(context, analyzer, 4);
    var trumpet = new Trumpet(context, analyzer);
    var bass = new Bass(context, analyzer);
    var slider = new Slider(context, analyzer);
    var whiteNoise = new WhiteNoiseWithBandPass(context, analyzer);
    
    function play(instrument, bar, note, durationBars) {
        instrument.play(bar * SECONDS_PER_BAR, note, durationBars * SECONDS_PER_BAR);
    }
    
    //play(sineTooth, 0, 261.63, 2);
    
    /*whiteNoise.play({
        startTime: 0,
        duration: 0.3,
        initialFrequency: 10000,
        initialQ: 100, 
        finalFrequency: 440,
        finalQ: 10,
    });*/
    
    // Megalovania
    play(sineTooth0, 0, D4, 1/16);
    play(sineTooth0, 0, A4, 1/16);
    play(sineTooth0, 1/16, D4, 1/16);
    play(sineTooth0, 1/16, A4, 1/16);
    play(sineTooth0, 1/8, D5, 1/8);
    play(sineTooth0, 1/4, A4, 3/16);
    play(sineTooth0, 7/16, Gs4, 1/8);
    play(sineTooth0, 9/16, G4, 1/8);
    play(sineTooth0, 11/16, F4, 1/8);
    play(sineTooth0, 13/16, D4, 1/16);
    play(sineTooth0, 14/16, F4, 1/16);
    play(sineTooth0, 15/16, G4, 1/16);
    
    play(bass, 0, D3, 1/8);
    play(bass, 1/8, D3, 1/8);
    play(bass, 1/4, D3, 1/16);
    play(bass, 5/16, D3, 1/16);
    play(bass, 7/16, D3, 1/8);
    play(bass, 9/16, D3, 1/8);
    play(bass, 11/16, D3, 1/16);
    play(bass, 12/16, D3, 1/16);
    play(bass, 13/16, D3, 1/16);
    play(bass, 14/16, D3, 1/8);
    
    play(sineTooth1, 1+0, C4, 1/16);
    play(sineTooth1, 1+0, G4, 1/16);
    play(sineTooth1, 1+1/16, C4, 1/16);
    play(sineTooth1, 1+1/16, G4, 1/16);
    play(sineTooth1, 1+1/8, D5, 1/8);
    play(sineTooth1, 1+1/4, A4, 3/16);
    play(sineTooth1, 1+7/16, Gs4, 1/8);
    play(sineTooth1, 1+9/16, G4, 1/8);
    play(sineTooth1, 1+11/16, F4, 1/8);
    play(sineTooth1, 1+13/16, D4, 1/16);
    play(sineTooth1, 1+14/16, F4, 1/16);
    play(sineTooth1, 1+15/16, G4, 1/16);
    
    play(bass, 1+0, C3, 1/8);
    play(bass, 1+1/8, C3, 1/8);
    play(bass, 1+1/4, C3, 1/16);
    play(bass, 1+5/16, C3, 1/16);
    play(bass, 1+7/16, C3, 1/8);
    play(bass, 1+9/16, C3, 1/8);
    play(bass, 1+11/16, C3, 1/16);
    play(bass, 1+12/16, C3, 1/16);
    play(bass, 1+13/16, C3, 1/16);
    play(bass, 1+14/16, C3, 1/8);
    
    play(sineTooth2, 2+0, B3, 1/16);
    play(sineTooth2, 2+0, Fs4, 1/16);
    play(sineTooth2, 2+1/16, B3, 1/16);
    play(sineTooth2, 2+1/16, Fs4, 1/16);
    play(sineTooth2, 2+1/8, D5, 1/8);
    play(sineTooth2, 2+1/4, A4, 3/16);
    play(sineTooth2, 2+7/16, Gs4, 1/8);
    play(sineTooth2, 2+9/16, G4, 1/8);
    play(sineTooth2, 2+11/16, F4, 1/8);
    play(sineTooth2, 2+13/16, D4, 1/16);
    play(sineTooth2, 2+14/16, F4, 1/16);
    play(sineTooth2, 2+15/16, G4, 1/16);
    
    play(bass, 2+0, B2, 1/8);
    play(bass, 2+1/8, B2, 1/8);
    play(bass, 2+1/4, B2, 1/16);
    play(bass, 2+5/16, B2, 1/16);
    play(bass, 2+7/16, B2, 1/8);
    play(bass, 2+9/16, B2, 1/8);
    play(bass, 2+11/16, B2, 1/16);
    play(bass, 2+12/16, B2, 1/16);
    play(bass, 2+13/16, B2, 1/16);
    play(bass, 2+14/16, B2, 1/8);
    
    play(sineTooth4, 3+0, As3, 1/16);
    play(sineTooth4, 3+0, F4, 1/16);
    play(sineTooth4, 3+1/16, As3, 1/16);
    play(sineTooth4, 3+1/16, F4, 1/16);
    play(sineTooth4, 3+1/8, D5, 1/8);
    play(sineTooth4, 3+1/4, A4, 3/16);
    play(sineTooth4, 3+7/16, Gs4, 1/8);
    play(sineTooth4, 3+9/16, G4, 1/8);
    play(sineTooth4, 3+11/16, F4, 1/8);
    play(sineTooth4, 3+13/16, D4, 1/16);
    play(sineTooth4, 3+14/16, F4, 1/16);
    play(sineTooth4, 3+15/16, G4, 1/16);
    
    play(bass, 3+0, As2, 1/8);
    play(bass, 3+1/8, As2, 1/8);
    play(bass, 3+1/4, As2, 1/16);
    play(bass, 3+5/16, As2, 1/16);
    play(bass, 3+7/16, C3, 1/8);
    play(bass, 3+9/16, C3, 1/8);
    play(bass, 3+11/16, C3, 1/16);
    play(bass, 3+12/16, C3, 1/16);
    play(bass, 3+13/16, C3, 1/16);
    play(bass, 3+14/16, C3, 5);
    
    //play(trumpet, 4, D4, 1);
    
    play(bassDrum, 0);
    play(bassDrum, 1/16);
    play(snareDrum, 2/16);
    play(bassDrum, 3/16);
    play(snareDrum, 4/16);
    play(snareDrum, 6/16);
    play(snareDrum, 8/16);
    
    play(bassDrum, 1+0);
    play(bassDrum, 1+1/16);
    play(snareDrum, 1+2/16);
    play(bassDrum, 1+3/16);
    play(snareDrum, 1+4/16);
    play(snareDrum, 1+6/16);
    play(snareDrum, 1+8/16);
    
    play(bassDrum, 2+0);
    play(bassDrum, 2+1/16);
    play(snareDrum, 2+2/16);
    play(bassDrum, 2+3/16);
    play(snareDrum, 2+4/16);
    play(snareDrum, 2+6/16);
    play(snareDrum, 2+8/16);
    
    play(bassDrum, 3+0);
    play(bassDrum, 3+1/16);
    play(snareDrum, 3+2/16);
    play(bassDrum, 3+3/16);
    play(snareDrum, 3+4/16);
    play(snareDrum, 3+6/16);
    play(snareDrum, 3+8/16);
    
    
    
    // Increasing speed drum pattern
    //slider.play(0, A2, A4 * 2, 0, 0.2, 3.75);
    /*var delta = 0.25;
    var repeats = 4;
    var bars = 0;
    
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < repeats; ++j) {
            play(snareDrum, bars);
            if (j % 2 == 0) {
                play(bassDrum, bars, 1);
            }
            bars += delta;
            if (j == 24) break;
        }
        delta /= 2;
        repeats *= 2;
    }*/
    
    setTimeout(function() { 
        context.close();
    }, 12000);
};