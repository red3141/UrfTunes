var BASICALLY_ZERO = 0.001; // Used when dropping gain to basically zero, since we can't exponentially drop to zero.

var currentChampionSet = -1;

window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
    } catch(e) {
        alert('Your browser does not support Urf Tunes; we recommend using Google Chrome.');
    }
};

function displayChampionSet(n) {
    if (n === currentChampionSet)
        return;
    currentChampionSet = n;
    for (var i = 0; i < 5; ++i)
        $('#champions' + i).toggle(i === n);
}

function clearChampionSet() {
    displayChampionSet(-1);
}

// Runs a function before the specified time is reached in the AudioContext
// Some devices (like phones) can't handle too many nodes at once, so we use this function to delay the creation of those nodes.
var runBefore = (function() {
    var timeDelta = 12;
    var deferredObjects = [];
    var timerInstrument;
    var currentContext;
    function resolvePromise(context, index) {
        console.log('Resolving deferred object at index ' + index);
        if (index >= deferredObjects.length)
            return;
        deferredObjects[index].resolve();
        createTimerInstrument(context, index + 1);
    }
    function createTimerInstrument(context, index) {
        console.log('Creating silent timer at index ' + index);
        if (index === 0) {
            resolvePromise(context, index);
        } else {
            var endTime = timeDelta * index;
            if (context.suspend) {
                // If the pause function works, we need to use a silent "instrument" to know when to resolve the promise
                timerInstrument = new TimerInstrument(context);
                var timerOscillator = timerInstrument.play({ endTime: endTime });
                $(timerOscillator).on('ended', function() {
                    resolvePromise(context, index);
                });
            } else {
                // User can't pause, so we are safe to use setTimeout(). The onended event doesn't work on all browsers, especially the ones that don't implement pause.
                var delaySeconds = context.currentTime ? endTime - context.currentTime : timeDelta;
                setTimeout(function() {
                    resolvePromise(context, index);
                }, delaySeconds * 1000);
            }
        }
    }
    return function runBefore(context, time) {
        if (context !== currentContext) {
            currentContext = context;
            deferredObjects = [$.Deferred()];
            createTimerInstrument(context, 0);
        }
        var index = Math.max(0, Math.floor((time - 2) / timeDelta));
        while (index >= deferredObjects.length) {
            console.log('Adding deferred object at index ' + deferredObjects.length);
            deferredObjects.push($.Deferred());
        }
        return deferredObjects[index].promise();
    };
})();

// Bass Drum
function BassDrum(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    this.pitch = 150;
    this.duration = 0.1;
};

BassDrum.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.type = 'triangle';
    var gain = this.context.createGain();
    oscillator.connect(gain);
    gain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain: gain,
    };
};

BassDrum.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var endTime = startTime + this.duration;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        source.oscillator.frequency.setValueAtTime(_this.pitch, startTime);
        source.oscillator.frequency.setValueAtTime(_this.pitch, startTime + 0.01);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(2, startTime + 0.01);
        source.oscillator.frequency.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        
        return source.oscillator;
    });
};

// Snare Drum
function SnareDrum(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    this.noiseBuffer = createNoiseBuffer(context);
    this.pitch = 100;
    this.oscillatorDuration = 0.1;
    this.noiseDuration = 0.2;
    this.filterMinPitch = 1500;
}

SnareDrum.prototype.createSource = function() {
    var noise = this.context.createBufferSource();
    noise.buffer = this.noiseBuffer;
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = this.filterMinPitch;
    noise.connect(noiseFilter);
    var noiseGain = this.context.createGain();
    noiseFilter.connect(noiseGain);
    
    noiseGain.connect(this.analyzer);
    
    var oscillator = this.context.createOscillator();
    oscillator.type = 'triangle';
    
    var oscillatorGain = this.context.createGain();
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        noise: noise,
        oscillatorGain: oscillatorGain,
        noiseGain: noiseGain,
    };
};

SnareDrum.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var volume = options.volume || 0.3;

    var oscillatorEndTime = startTime + this.oscillatorDuration;
    var noiseEndTime = startTime + this.noiseDuration;
    var endTime = Math.max(oscillatorEndTime, noiseEndTime);
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        source.noiseGain.gain.setValueAtTime(volume, startTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, noiseEndTime);
        source.noise.start(startTime);
        
        source.oscillator.frequency.setValueAtTime(_this.pitch, startTime);
        source.oscillatorGain.gain.setValueAtTime(volume, startTime);
        source.oscillatorGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, oscillatorEndTime);
        source.oscillator.start(startTime);
        
        source.noise.stop(endTime);
        source.oscillator.stop(endTime);
        
        return source.oscillator;
    });
}

// SineTooth
// Build a wave from 26 (= 130/5) of the champion mastery levels. 26 was chosen due to restrictions
// in how many harmonics can be using the AnalyserNode at normal pitches.
// Note: this is pretty reliant on there being exactly 130 champions right now. RIP Taliyah.

function SineTooth(context, analyzer, mode) {
    this.context = context;
    this.analyzer = analyzer;
    
    var NUMBER_OF_MODES = 5;
    var CHAMPS_PER_MODE = championNames.length / NUMBER_OF_MODES;
    mode %= NUMBER_OF_MODES;
    
    this.mode = mode;
    
    var length = CHAMPS_PER_MODE + 2;
    var real = new Float32Array(length);
    var imag = new Float32Array(length);
    
    // Build on top of a pure sine wave
    real[0] = 0;
    imag[0] = 0;
    real[1] = 0;
    imag[1] = 1;
    var power, championName;
    for (var i = 0; i < CHAMPS_PER_MODE; ++i) {
        championName = championNames[i + (this.mode * CHAMPS_PER_MODE)];
        power =  Math.pow(2, masteries[championName]);
        power /= 32.0;
        power = power == 1/32 ? 0 : power;
        imag[i + 2] = power;
        real[i + 2] = 0;
    }
    
    this.waveform = this.context.createPeriodicWave(real, imag);
}

SineTooth.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.setPeriodicWave(this.waveform);
    
    var gain = this.context.createGain();
    oscillator.connect(gain);
    gain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain:gain,
    };
};

SineTooth.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;
    var volume = options.volume || 0.15;
    var finalVolume = options.finalVolume || volume;
    
    var attackGain = volume * 2;
    var reduceGain = volume;

    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, startTime + duration);
    var endTime = fallOffTime + 0.01;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        source.oscillator.frequency.setValueAtTime(pitch, startTime);
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(attackGain, attackEndTime);
        source.gain.gain.exponentialRampToValueAtTime(reduceGain, reduceEndTime);
        source.gain.gain.exponentialRampToValueAtTime(finalVolume, fallOffTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        
        var mode = _this.mode;
        
        $(source.oscillator).on('ended', function() {
            displayChampionSet(mode);
        });
        
        return source.oscillator;
    });
};


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

Trumpet.prototype.createSource = function() {
    var oscillator1 = this.context.createOscillator();
    oscillator1.setPeriodicWave(this.waveform);
    var oscillator2 = this.context.createOscillator();
    oscillator2.setPeriodicWave(this.waveform);
 
    var gain = this.context.createGain();
    oscillator1.connect(gain);
    oscillator2.connect(gain);
    
    var filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    
    gain.connect(filter);
    filter.connect(this.analyzer);
    
    return {
        oscillator1: oscillator1,
        oscillator2: oscillator2,
        gain:gain,
    };
};

Trumpet.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;

    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, startTime + duration);
    var endTime = fallOffTime + 0.01;
    
    var _this = this;
    return runBefore(_this.context, startTime).then(function() {
        var source = _this.createSource();
        source.oscillator1.frequency.setValueAtTime(pitch, startTime);
        source.oscillator1.detune.value = 10;
        source.oscillator2.frequency.setValueAtTime(pitch, startTime);
        source.oscillator2.detune.value = -10;
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.linearRampToValueAtTime(0.4, attackEndTime);
        source.gain.gain.linearRampToValueAtTime(0.2, reduceEndTime);
        source.gain.gain.exponentialRampToValueAtTime(0.4, fallOffTime);
        source.gain.gain.linearRampToValueAtTime(0, endTime);
        
        source.oscillator1.start(startTime);
        source.oscillator1.stop(endTime);
        source.oscillator2.start(startTime);
        source.oscillator2.stop(endTime);
        
        return source.oscillator1;
    });
};


function Piano(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    
    var coefs = [0, 1, 0.1, 0.31, 0.06, 0.05, 0.05, 0.0001, 0.02, 0.000001, 0.01, 0.00001];
    var real = new Float32Array(coefs);
    var imag = new Float32Array(coefs.length);
    
    this.waveform = this.context.createPeriodicWave(real, imag);
    this.noiseBuffer = createNoiseBuffer(context);
}

Piano.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.setPeriodicWave(this.waveform);
 
    var gain = this.context.createGain();
    oscillator.connect(gain);
    
    var noise = this.context.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noise.connect(noiseFilter);
    
    var noiseGain = this.context.createGain();
    noiseFilter.connect(noiseGain);
    
    gain.connect(this.analyzer);
    noiseGain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain: gain,
        noise: noise,
        noiseGain: noiseGain,
        noiseFilter: noiseFilter,
    };
};

Piano.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;
    var volume = options.volume || 0.15;

    var attackGain = volume * 5.3;
    var reduceGain = volume;
    var maxDurationSeconds = 1;

    var attackEndTime = startTime + 0.01;
    var reduceEndTime = attackEndTime + 0.2;
    var fallOffTime = Math.max(reduceEndTime, Math.min(reduceEndTime + maxDurationSeconds, startTime + duration));
    var endTime = fallOffTime + 0.03;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        
        source.oscillator.frequency.setValueAtTime(pitch, startTime);
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(attackGain, attackEndTime);
        source.gain.gain.exponentialRampToValueAtTime(reduceGain, reduceEndTime);
        
        source.noiseFilter.frequency.setValueAtTime(pitch, startTime);
        source.noiseFilter.Q.setValueAtTime(9, startTime);
        
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(0.5, attackEndTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(0.01, reduceEndTime);
        
        // The piano can't be "held," it will fall off over time no matter what
        source.gain.gain.exponentialRampToValueAtTime(
            reduceGain * (1 + BASICALLY_ZERO - ((fallOffTime - reduceEndTime) / maxDurationSeconds)),
            fallOffTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        source.noise.start(startTime);
        source.noise.stop(endTime);
        
        return source.oscillator;
    });
};

function Guitar(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    
    var coefs = [1, 0.68, 1.25, 0.15, 0.15, 0.15, 0.0001, 0.01, 0.2, 0.08, 0.02, 0.000001, 0.01];
    var real = new Float32Array(coefs);
    var imag = new Float32Array(coefs.length);
    
    this.waveform = this.context.createPeriodicWave(real, imag);
    this.noiseBuffer = createNoiseBuffer(context);
}

Guitar.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.setPeriodicWave(this.waveform);

    var gain = this.context.createGain();
    oscillator.connect(this.gain);

    var noise = this.context.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noise.connect(this.noiseFilter);

    var noiseGain = this.context.createGain();
    noiseFilter.connect(noiseGain);

    gain.connect(this.analyzer);
    noiseGain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain: gain,
        noise: noise,
        noiseGain: noiseGain,
    };
};

Guitar.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;
    var volume = options.volume || 0.15;

    var attackGain = volume * 4.5;
    var reduceGain = volume;
    var maxDurationSeconds = 1;

    var attackEndTime = startTime + 0.01;
    var reduceEndTime = attackEndTime + 0.06;
    var fallOffTime = Math.max(reduceEndTime, Math.min(reduceEndTime + maxDurationSeconds, startTime + duration));
    var endTime = fallOffTime + 0.03;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        source.oscillator.frequency.setValueAtTime(pitch, startTime);
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(attackGain, attackEndTime);
        source.gain.gain.exponentialRampToValueAtTime(reduceGain, reduceEndTime);
        
        source.noiseFilter.frequency.setValueAtTime(pitch, startTime);
        source.noiseFilter.Q.setValueAtTime(9, startTime);
        
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(0.5, attackEndTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(0.01, reduceEndTime);
        
        // The guitar can't be "held," it will fall off over time no matter what
        source.gain.gain.exponentialRampToValueAtTime(
            reduceGain * (1 + BASICALLY_ZERO - ((fallOffTime - reduceEndTime) / maxDurationSeconds)),
            fallOffTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        source.noise.start(startTime);
        source.noise.stop(endTime);
        
        return source.oscillator;
    });
};

// It's called a Violin. It sounds more like an accordion. Meh.
function Violin(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
    
    var coefs = [1, 0.9, 0.5, 0.7, 0.4, 0.5, 0.55, 0.3, 0.2, 0.2, 0.25, 0.5, 0.2, 0.1, 0.5, 0.2, 0.1, 0.01, 0.000001, 0.002, 0.000001, 0.000001, 0.000001, 0.00001, 0.00002];
    var real = new Float32Array(coefs);
    var imag = new Float32Array(coefs.length);
    
    this.waveform = this.context.createPeriodicWave(real, imag);
}

Violin.prototype.createSource = function() {
    var oscillator1 = this.context.createOscillator();
    oscillator1.setPeriodicWave(this.waveform);
    var oscillator2 = this.context.createOscillator();
    oscillator2.setPeriodicWave(this.waveform);
 
    var gain = this.context.createGain();
    oscillator1.connect(gain);
    oscillator2.connect(gain);
    
    var filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    
    gain.connect(filter);
    filter.connect(this.analyzer);
    
    return {
        oscillator1: oscillator1,
        oscillator2: oscillator2,
        gain: gain,
    };
};

Violin.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;
    var volume = options.volume || 0.1;
    var finalVolume = options.finalVolume || volume;

    var attackEndTime = startTime + 0.1;
    var fallOffTime = Math.max(attackEndTime, startTime + duration);
    var endTime = fallOffTime + 0.05;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();

        source.oscillator1.frequency.setValueAtTime(pitch, startTime);
        source.oscillator1.detune.value = 5;
        source.oscillator2.frequency.setValueAtTime(pitch, startTime);
        source.oscillator2.detune.value = -5;
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(volume, attackEndTime);
        source.gain.gain.exponentialRampToValueAtTime(finalVolume, fallOffTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator1.start(startTime);
        source.oscillator1.stop(endTime);
        source.oscillator2.start(startTime);
        source.oscillator2.stop(endTime);
        
        return source.oscillator1;
    });
};

// Bass
// If you use this instrument for non-low notes, you're gonna have a bad time :sans:

function Bass(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
}

Bass.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.type = 'triangle';
 
    var gain = this.context.createGain();
    oscillator.connect(gain);
    gain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain: gain,
    };
};

Bass.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var pitch = options.pitch || 440;
    var duration = options.duration || 1;
    var volume = options.volume || 0.5;
    var finalVolume = options.finalVolume || 0;

    var attackGain = volume * 1.8;
    var reduceGain = volume;
    var maxDurationSeconds = 3.0;

    var attackEndTime = startTime + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, Math.min(reduceEndTime + maxDurationSeconds, startTime + duration));
    var endTime = fallOffTime + 0.01;
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        source.oscillator.frequency.setValueAtTime(pitch, startTime);
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(attackGain, attackEndTime);
        if (!finalVolume) {
            // The bass can't be "held," it will fall off over time no matter what
            source.gain.gain.exponentialRampToValueAtTime(
                reduceGain * (1 + BASICALLY_ZERO - ((fallOffTime - reduceEndTime) / maxDurationSeconds)),
                fallOffTime);
        } else {
            source.gain.gain.exponentialRampToValueAtTime(finalVolume, fallOffTime);
        }
        source.gain.gain.linearRampToValueAtTime(0, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        
        return source.oscillator;
    });
};

// Slider

function Slider(context, analyzer) {
    this.context = context;
    this.analyzer = analyzer;
}

Slider.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.type = 'sine';
 
    var gain = this.context.createGain();
    oscillator.connect(gain);
    gain.connect(this.analyzer);
    
    return {
        oscillator: oscillator,
        gain: gain,
    }
};

Slider.prototype.play = function(options) {
    options = options || {};
    var startTime = options.startTime || 0;
    var fromPitch = options.fromPitch || 440;
    var toPitch = options.toPitch || options.fromPitch;
    var fromGain = options.fromGain || 1;
    var toGain = options.toGain || options.fromGain;
    var duration = options.duration || 1;

    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        // Ramp up/down at the beginning/end of being played to avoid clicks.
        var rampUpTime = 0.02;
        var rampDownTime = 0.02;
        var rampUpEndTime = startTime + rampUpTime;
        var holdTime = duration;
        holdTime = Math.max(holdTime, rampUpTime);
        var rampDownStartTime = startTime + holdTime;
        var endTime = rampDownStartTime + rampDownTime;
        
        source.oscillator.frequency.setValueAtTime(fromPitch, tstartTimeime);
        source.oscillator.frequency.linearRampToValueAtTime(toPitch, endTime);
        
        // Avoid errors if fromGain or toGain is 0
        fromGain = Math.max(fromGain, BASICALLY_ZERO);
        toGain = Math.max(toGain, BASICALLY_ZERO);
        
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.gain.gain.setValueAtTime(BASICALLY_ZERO, startTime);
        source.gain.gain.exponentialRampToValueAtTime(fromGain, rampUpEndTime);
        source.gain.gain.linearRampToValueAtTime(toGain, rampDownStartTime);
        source.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.oscillator.start(startTime);
        source.oscillator.stop(endTime);
        
        return source.oscillator;
    });
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

WhiteNoiseWithFilter.prototype.baseCreateSource = function() {
    var noise = this.context.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noise.connect(noiseFilter);
    var noiseGain = this.context.createGain();
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.analyzer);
    
    return {
        noise: noise,
        noiseFilter: noiseFilter,
        noiseGain: noiseGain,
    }
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
    
    var _this = this;
    return runBefore(this.context, startTime).then(function() {
        var source = _this.createSource();
        
        var rampUpStartTime = Math.max(startTime - 0.02, 0);
        var rampDownStartTime = startTime + duration - 0.02;
        var endTime = startTime + duration;
        
        source.noiseFilter.frequency.setValueAtTime(initialFrequency, startTime);
        source.noiseFilter.Q.setValueAtTime(initialQ, startTime);
        source.noiseFilter.frequency.exponentialRampToValueAtTime(finalFrequency, endTime);
        source.noiseFilter.Q.exponentialRampToValueAtTime(finalQ, endTime);
        
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, 0);
        source.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, rampUpStartTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(volume, startTime);
        source.noiseGain.gain.setValueAtTime(volume, rampDownStartTime);
        source.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
        
        source.noise.start(rampUpStartTime);
        source.noise.stop(endTime);
        
        return source.noise;
    });
};

function WhiteNoiseWithBandPass(context, analyzer) {
    this.baseConstructor(context, analyzer);
}
WhiteNoiseWithBandPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithBandPass.prototype.init = function() {
    var source = this.baseCreateSource();
    source.noiseFilter.type = 'bandpass';
};

function WhiteNoiseWithNotch(context, analyzer) {
    this.baseConstructor(context, analyzer);
}
WhiteNoiseWithNotch.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithNotch.prototype.init = function() {
    var source = this.baseCreateSource();
    source.noiseFilter.type = 'notch';
};

function WhiteNoiseWithLowPass(context, analyzer) {
    this.baseConstructor(context, analyzer);
}
WhiteNoiseWithLowPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithLowPass.prototype.init = function() {
    var source = this.baseCreateSource();
    source.noiseFilter.type = 'lowpass';
};

function WhiteNoiseWithHighPass(context, analyzer) {
    this.baseConstructor(context, analyzer);
}
WhiteNoiseWithHighPass.prototype = new WhiteNoiseWithFilter();
WhiteNoiseWithHighPass.prototype.init = function() {
    var source = this.baseCreateSource();
    source.noiseFilter.type = 'highpass';
};

// TimerInstrument: a silent instrument used purely for firing events at specific times
function TimerInstrument(context) {
    this.context = context;
}

TimerInstrument.prototype.createSource = function() {
    var oscillator = this.context.createOscillator();
    oscillator.type = 'triangle';
 
    var gain = this.context.createGain();
    gain.gain.setValueAtTime(BASICALLY_ZERO, 0);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    
    return {
        oscillator: oscillator,
        gain: gain,
    };
};

TimerInstrument.prototype.play = function(options) {
    options = options || {};
    var endTime = options.endTime || 0;

    var source = this.createSource();
    source.oscillator.start(Math.max(endTime - 1, 0));
    source.oscillator.stop(endTime);
    return source.oscillator;
};

var isVisualizationStopped = true;

function doVisualization(analyzer) {
    isVisualizationStopped = false;
    var canvas = document.getElementById('visualizationArea');
    var canvasContext = canvas.getContext('2d');
    canvas.width = 0;
    canvas.width = Math.max(512, $(document).width());
    
    var width = canvas.width;
    var height = canvas.height;
    analyzer.fftSize = 1024;
    var bufferLength = analyzer.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    var draw = function() {
    
        analyzer.getByteFrequencyData(dataArray);
        
        canvasContext.clearRect(0, 0, width, height);
        
        var barWidth = (width / bufferLength);
        var barHeight;
        var x = 0;
        
        for (var i = 0; i < bufferLength; ++i) {
            barHeight = dataArray[i];
            
            canvasContext.fillStyle = 'rgb(0,' + barHeight + ',' + (255 - barHeight) + ')';
            canvasContext.fillRect(x, height-barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        if (!isVisualizationStopped)
            window.requestAnimationFrame(draw);
    };
    
    draw();
}

function stopVisualization() {
    isVisualizationStopped = true;
}