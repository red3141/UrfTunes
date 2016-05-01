var context;

var masteries = {
    'aatrox' : 0,
    'ahri' : 0,
    'akali' : 0,
    'alistar' : 0,
    'amumu' : 5,
    'anivia' : 0,
    'annie' : 1,
    'ashe' : 1,
    'aurelionsol' : 0,
    'azir' : 0,
    'bard' : 1,
    'blitzcrank' : 2,
    'brand' : 1,
    'braum' : 3,
    'caitlyn' : 1,
    'cassiopeia' : 0,
    'chogath' : 3,
    'corki' : 0,
    'darius' : 2,
    'diana' : 3,
    'drmundo' : 0,
    'draven' : 0,
    'ekko' : 1,
    'elise' : 1,
    'evelynn' : 0,
    'ezreal' : 0,
    'fiddlesticks' : 2,
    'fiora' : 2,
    'fizz' : 2,
    'galio' : 3,
    'gangplank' : 0,
    'garen' : 0,
    'gnar' : 1,
    'gragas' : 0,
    'graves' : 0,
    'hecarim' : 1,
    'heimerdinger' : 0,
    'illaoi' : 0,
    'irelia' : 0,
    'janna' : 1,
    'jarvaniv' : 0,
    'jax' : 0,
    'jayce' : 0,
    'jhin' : 0,
    'jinx' : 1,
    'kalista' : 1,
    'karma' : 0,
    'karthus' : 2,
    'kassadin' : 0,
    'katarina' : 0,
    'kayle' : 0,
    'kennen' : 0,
    'khazix' : 2,
    'kindred' : 1,
    'kogmaw' : 1,
    'leblanc' : 0,
    'leesin' : 0,
    'leona' : 3,
    'lissandra' : 0,
    'lucian' : 0,
    'lulu' : 3,
    'lux' : 4,
    'malphite' : 5,
    'malzahar' : 1,
    'maokai' : 5,
    'masteryi' : 2,
    'missfortune' : 2,
    'mordekaiser' : 2,
    'morgana' : 2,
    'nami' : 5,
    'nasus' : 1,
    'nautilus' : 5,
    'nidalee' : 0,
    'nocturne' : 3,
    'nunu' : 0,
    'olaf' : 0,
    'orianna' : 0,
    'pantheon' : 0,
    'poppy' : 5,
    'quinn' : 1,
    'rammus' : 5,
    'reksai' : 0,
    'renekton' : 0,
    'rengar' : 0,
    'riven' : 0,
    'rumble' : 0,
    'ryze' : 0,
    'sejuani' : 5,
    'shaco' : 1,
    'shen' : 0,
    'shyvana' : 1,
    'singed' : 0,
    'sion' : 1,
    'sivir' : 0,
    'skarner' : 1,
    'sona' : 4,
    'soraka' : 0,
    'swain' : 0,
    'syndra' : 0,
    'tahmkench' : 5,
    'talon' : 0,
    'taric' : 1,
    'teemo' : 4,
    'thresh' : 3,
    'tristana' : 1,
    'trundle' : 0,
    'tryndamere' : 0,
    'twistedfate' : 0,
    'twitch' : 0,
    'udyr' : 2,
    'urgot' : 0,
    'varus' : 1,
    'vayne' : 1,
    'veigar' : 0,
    'velkoz' : 1,
    'vi' : 4,
    'viktor' : 0,
    'vladimir' : 2,
    'volibear' : 0,
    'warwick' : 0,
    'wukong' : 2,
    'xerath' : 0,
    'xinzhao' : 0,
    'yasuo' : 1,
    'yorick' : 0,
    'zac' : 5,
    'zed' : 0,
    'ziggs' : 2,
    'zilean' : 0,
    'zyra' : 2
}

masteries = {
    'aatrox' : 0,
    'ahri' : 0,
    'akali' : 0,
    'alistar' : 2,
    'amumu' : 2,
    'anivia' : 0,
    'annie' : 3,
    'ashe' : 3,
    'aurelionsol' : 0,
    'azir' : 0,
    'bard' : 3,
    'blitzcrank' : 3,
    'brand' : 0,
    'braum' : 2,
    'caitlyn' : 2,
    'cassiopeia' : 0,
    'chogath' : 1,
    'corki' : 5,
    'darius' : 0,
    'diana' : 0,
    'drmundo' : 0,
    'draven' : 0,
    'ekko' : 0,
    'elise' : 0,
    'evelynn' : 0,
    'ezreal' : 1,
    'fiddlesticks' : 1,
    'fiora' : 0,
    'fizz' : 0,
    'galio' : 0,
    'gangplank' : 0,
    'garen' : 1,
    'gnar' : 0,
    'gragas' : 0,
    'graves' : 0,
    'hecarim' : 0,
    'heimerdinger' : 0,
    'illaoi' : 0,
    'irelia' : 0,
    'janna' : 3,
    'jarvaniv' : 1,
    'jax' : 0,
    'jayce' : 0,
    'jhin' : 1,
    'jinx' : 5,
    'kalista' : 2,
    'karma' : 0,
    'karthus' : 0,
    'kassadin' : 0,
    'katarina' : 0,
    'kayle' : 0,
    'kennen' : 1,
    'khazix' : 0,
    'kindred' : 0,
    'kogmaw' : 4,
    'leblanc' : 0,
    'leesin' : 0,
    'leona' : 2,
    'lissandra' : 0,
    'lucian' : 5,
    'lulu' : 0,
    'lux' : 0,
    'malphite' : 2,
    'malzahar' : 0,
    'maokai' : 1,
    'masteryi' : 0,
    'missfortune' : 5,
    'mordekaiser' : 0,
    'morgana' : 4,
    'nami' : 1,
    'nasus' : 2,
    'nautilus' : 2,
    'nidalee' : 0,
    'nocturne' : 0,
    'nunu' : 0,
    'olaf' : 0,
    'orianna' : 0,
    'pantheon' : 0,
    'poppy' : 0,
    'quinn' : 0,
    'rammus' : 1,
    'reksai' : 0,
    'renekton' : 1,
    'rengar' : 0,
    'riven' : 0,
    'rumble' : 0,
    'ryze' : 0,
    'sejuani' : 0,
    'shaco' : 0,
    'shen' : 0,
    'shyvana' : 0,
    'singed' : 0,
    'sion' : 0,
    'sivir' : 5,
    'skarner' : 0,
    'sona' : 1,
    'soraka' : 1,
    'swain' : 0,
    'syndra' : 0,
    'tahmkench' : 0,
    'talon' : 0,
    'taric' : 0,
    'teemo' : 0,
    'thresh' : 5,
    'tristana' : 5,
    'trundle' : 0,
    'tryndamere' : 0,
    'twistedfate' : 1,
    'twitch' : 0,
    'udyr' : 0,
    'urgot' : 0,
    'varus' : 0,
    'vayne' : 1,
    'veigar' : 0,
    'velkoz' : 1,
    'vi' : 1,
    'viktor' : 0,
    'vladimir' : 2,
    'volibear' : 0,
    'warwick' : 0,
    'wukong' : 0,
    'xerath' : 0,
    'xinzhao' : 0,
    'yasuo' : 0,
    'yorick' : 0,
    'zac' : 2,
    'zed' : 0,
    'ziggs' : 3,
    'zilean' : 0,
    'zyra' : 0
}
//*/

var championNames = [
    'aatrox',
    'ahri',
    'akali',
    'alistar',
    'amumu',
    'anivia',
    'annie',
    'ashe',
    'aurelionsol',
    'azir',
    'bard',
    'blitzcrank',
    'brand',
    'braum',
    'caitlyn',
    'cassiopeia',
    'chogath',
    'corki',
    'darius',
    'diana',
    'drmundo',
    'draven',
    'ekko',
    'elise',
    'evelynn',
    'ezreal',
    'fiddlesticks',
    'fiora',
    'fizz',
    'galio',
    'gangplank',
    'garen',
    'gnar',
    'gragas',
    'graves',
    'hecarim',
    'heimerdinger',
    'illaoi',
    'irelia',
    'janna',
    'jarvaniv',
    'jax',
    'jayce',
    'jhin',
    'jinx',
    'kalista',
    'karma',
    'karthus',
    'kassadin',
    'katarina',
    'kayle',
    'kennen',
    'khazix',
    'kindred',
    'kogmaw',
    'leblanc',
    'leesin',
    'leona',
    'lissandra',
    'lucian',
    'lulu',
    'lux',
    'malphite',
    'malzahar',
    'maokai',
    'masteryi',
    'missfortune',
    'mordekaiser',
    'morgana',
    'nami',
    'nasus',
    'nautilus',
    'nidalee',
    'nocturne',
    'nunu',
    'olaf',
    'orianna',
    'pantheon',
    'poppy',
    'quinn',
    'rammus',
    'reksai',
    'renekton',
    'rengar',
    'riven',
    'rumble',
    'ryze',
    'sejuani',
    'shaco',
    'shen',
    'shyvana',
    'singed',
    'sion',
    'sivir',
    'skarner',
    'sona',
    'soraka',
    'swain',
    'syndra',
    'tahmkench',
    'talon',
    'taric',
    'teemo',
    'thresh',
    'tristana',
    'trundle',
    'tryndamere',
    'twistedfate',
    'twitch',
    'udyr',
    'urgot',
    'varus',
    'vayne',
    'veigar',
    'velkoz',
    'vi',
    'viktor',
    'vladimir',
    'volibear',
    'warwick',
    'wukong',
    'xerath',
    'xinzhao',
    'yasuo',
    'yorick',
    'zac',
    'zed',
    'ziggs',
    'zilean',
    'zyra'
]

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
function BassDrum(context) {
    this.context = context;
    this.pitch = 150;
    this.duration = 0.1;
};

BassDrum.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
};

BassDrum.prototype.play = function(bars) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var endTime = time + this.duration;
    
    this.oscillator.frequency.setValueAtTime(this.pitch, time);
    this.oscillator.frequency.setValueAtTime(this.pitch, time + 0.01);
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, time);
    this.gain.gain.exponentialRampToValueAtTime(MAX_GAIN, time + 0.01);
    
    this.oscillator.frequency.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

// Snare Drum
function SnareDrum(context) {
    this.context = context;
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
    
    this.noiseGain.connect(this.context.destination);
    
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
    
    this.oscillatorGain = this.context.createGain();
    this.oscillator.connect(this.oscillatorGain);
    this.oscillatorGain.connect(this.context.destination);
};

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

// SineTooth

function SineTooth(context) {
    this.context = context;
    
    var length = championNames.length + 2;
    var real = new Float32Array(length);
    var imag = new Float32Array(length);
    
    // Build on top of a pure sine wave
    real[0] = 0;
    imag[0] = 0;
    real[1] = 1;
    imag[1] = 0;
    var power;
    for (var i = 2; i < length; ++i) {
        power = masteries[championNames[i]];
        power *= power;
        power /= 25.0;
        real[i] = (1/i) * power;
        imag[i] = 0;
    }
    
    this.waveform = this.context.createPeriodicWave(real, imag);
}

SineTooth.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.setPeriodicWave(this.waveform);
    
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
};

SineTooth.prototype.play = function(bars, pitch, holdBars) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var attackEndTime = time + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, time + SECONDS_PER_BAR * holdBars);
    var endTime = fallOffTime + 0.01;
    
    this.oscillator.frequency.setValueAtTime(pitch, time);
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, time);
    this.gain.gain.linearRampToValueAtTime(0.4, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(0.2, reduceEndTime);
    this.gain.gain.setValueAtTime(0.2, fallOffTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

// Trumpet

function Trumpet(context) {
    this.context = context;
    
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
    this.filter.connect(this.context.destination);
};

Trumpet.prototype.play = function(bars, pitch, holdBars) {
    this.init();

    var time = songStartTime + SECONDS_PER_BAR * bars;
    var attackEndTime = time + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, time + SECONDS_PER_BAR * holdBars);
    var endTime = fallOffTime + 0.01;
    
    this.oscillator1.frequency.setValueAtTime(pitch, time);
    this.oscillator1.detune.value = 10;
    this.oscillator2.frequency.setValueAtTime(pitch, time);
    this.oscillator2.detune.value = -10;
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, time);
    this.gain.gain.linearRampToValueAtTime(0.4, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(0.2, reduceEndTime);
    this.gain.gain.exponentialRampToValueAtTime(0.4, fallOffTime);
    this.gain.gain.linearRampToValueAtTime(0, endTime);
    
    this.oscillator1.start(time);
    this.oscillator1.stop(endTime);
    this.oscillator2.start(time);
    this.oscillator2.stop(endTime);
};

// Bass
// If you use this instrument for non-low notes, you're gonna have a bad time :sans:

function Bass(context) {
    this.context = context;
}

Bass.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';
 
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    
    this.gain.connect(this.context.destination);
};

Bass.prototype.play = function(bars, pitch, holdBars) {
    this.init();
        
    var attackGain = 0.9;
    var reduceGain = 0.5;
    var maxDurationSeconds = 3.0;

    var time = songStartTime + SECONDS_PER_BAR * bars;
    var attackEndTime = time + 0.02;
    var reduceEndTime = attackEndTime + 0.02;
    var fallOffTime = Math.max(reduceEndTime, Math.min(reduceEndTime + maxDurationSeconds, time + SECONDS_PER_BAR * holdBars));
    var endTime = fallOffTime + 0.01;
    
    this.oscillator.frequency.setValueAtTime(pitch, time);
    
    this.gain.gain.setValueAtTime(BASICALLY_ZERO, time);
    this.gain.gain.linearRampToValueAtTime(attackGain, attackEndTime);
    this.gain.gain.linearRampToValueAtTime(reduceGain, reduceEndTime);
    // The bass can't be "held," it will fall off over time no matter what
    this.gain.gain.exponentialRampToValueAtTime(
        reduceGain * (1 + BASICALLY_ZERO - ((fallOffTime - reduceEndTime) / maxDurationSeconds)),
        fallOffTime);
    this.gain.gain.linearRampToValueAtTime(0, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

// Slider

function Slider(context) {
    this.context = context;
}

Slider.prototype.init = function() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'sine';
 
    this.gain = this.context.createGain();
    this.oscillator.connect(this.gain);
    
    this.gain.connect(this.context.destination);
};

Slider.prototype.play = function(bars, fromPitch, toPitch, fromGain, toGain, holdBars) {
    this.init();

    var time = songStartTime + SECONDS_PER_BAR * bars;
    // Ramp up/down at the beginning/end of being played to avoid clicks.
    var rampUpTime = 0.02;
    var rampDownTime = 0.02;
    var rampUpEndTime = time + rampUpTime;
    var holdTime = SECONDS_PER_BAR * holdBars;
    holdTime = Math.max(holdTime, rampUpTime);
    var rampDownStartTime = time + holdTime;
    var endTime = rampDownStartTime + rampDownTime;
    
    this.oscillator.frequency.setValueAtTime(fromPitch, time);
    this.oscillator.frequency.linearRampToValueAtTime(toPitch, endTime);
    
    // Avoid errors if fromGain or toGain is 0
    fromGain = Math.max(fromGain, BASICALLY_ZERO);
    toGain = Math.max(toGain, BASICALLY_ZERO);
    
    this.gain.gain.setValueAtTime(0, time);
    this.gain.gain.exponentialRampToValueAtTime(fromGain, rampUpEndTime);
    this.gain.gain.linearRampToValueAtTime(toGain, rampDownStartTime);
    this.gain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.oscillator.start(time);
    this.oscillator.stop(endTime);
};

// White noise with a filter

function WhiteNoiseWithAFilter(context) {
    this.context = context;
    this.noiseBuffer = this.createNoiseBuffer();
}

WhiteNoiseWithAFilter.prototype.createNoiseBuffer = function() {
    var bufferSize = this.context.sampleRate;
    var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    var output = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; ++i) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
};

WhiteNoiseWithAFilter.prototype.init = function() {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer;
    this.noise.loop = true;
    this.noiseFilter = this.context.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noise.connect(this.noiseFilter);
    this.noiseGain = this.context.createGain();
    this.noiseFilter.connect(this.noiseGain);
    
    this.noiseGain.connect(this.context.destination);
};

WhiteNoiseWithAFilter.prototype.play = function(bars, durationBars, frequency, qualityFactor) {
    this.init();
    
    var time = songStartTime + SECONDS_PER_BAR * bars;
    var rampUpTime = time + 0.02;
    var rampDownTime = rampUpTime + SECONDS_PER_BAR * durationBars;
    var endTime = rampDownTime + 0.02;
    
    this.noiseFilter.frequency.setValueAtTime(frequency, time);
    this.noiseFilter.Q.setValueAtTime(qualityFactor, time);
    
    this.noiseGain.gain.setValueAtTime(BASICALLY_ZERO, time);
    this.noiseGain.gain.exponentialRampToValueAtTime(1, rampUpTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(1, rampDownTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(BASICALLY_ZERO, endTime);
    
    this.noise.start(time);
    this.noise.stop(endTime);
};

WhiteNoiseWithAFilter.prototype.linearRampCenterPitchToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.frequency.linearRampToValueAtTime(newValue, time);
    }
};

WhiteNoiseWithAFilter.prototype.exponentialRampCenterPitchToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.frequency.exponentialRampToValueAtTime(newValue, time);
    }
};

WhiteNoiseWithAFilter.prototype.setCenterPitchToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.frequency.setValueAtTime(newValue, time);
    }
};

WhiteNoiseWithAFilter.prototype.linearRampQualityFactorToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.Q.linearRampToValueAtTime(newValue, time);
    }
};

WhiteNoiseWithAFilter.prototype.exponentialRampQualityFactorToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.Q.exponentialRampToValueAtTime(newValue, time);
    }
}

WhiteNoiseWithAFilter.prototype.setQualityFactorToValueAtBars = function(newValue, bars) {
    var time = songStartTime + SECONDS_PER_BAR * bars;
    if (this.noiseFilter) {
        this.noiseFilter.Q.setValueAtTime(newValue, time);
    }
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

function playSong() {
    songStartTime = context.currentTime;
    
    // Create the instruments for the song.
    var bassDrum = new BassDrum(context);
    var snareDrum = new SnareDrum(context);
    var sineTooth = new SineTooth(context);
    var trumpet = new Trumpet(context);
    var bass = new Bass(context);
    var slider = new Slider(context);
    var whiteNoiseWithAFilter = new WhiteNoiseWithAFilter(context);
    
    whiteNoiseWithAFilter.play(0, 2, 440, BASICALLY_ZERO);
    whiteNoiseWithAFilter.exponentialRampQualityFactorToValueAtBars(100, 1);
    whiteNoiseWithAFilter.setQualityFactorToValueAtBars(100, 1.25);
    whiteNoiseWithAFilter.linearRampQualityFactorToValueAtBars(BASICALLY_ZERO, 2);
    
    // Megalovania
    /*trumpet.play(0, D4, 1/16);
    trumpet.play(0, A4, 1/16);
    trumpet.play(1/16, D4, 1/16);
    trumpet.play(1/16, A4, 1/16);
    trumpet.play(1/8, D5, 1/8);
    trumpet.play(1/4, A4, 3/16);
    trumpet.play(7/16, Gs4, 1/8);
    trumpet.play(9/16, G4, 1/8);
    trumpet.play(11/16, F4, 1/8);
    trumpet.play(13/16, D4, 1/16);
    trumpet.play(14/16, F4, 1/16);
    trumpet.play(15/16, G4, 1/16);
    
    bass.play(0, D3, 1/8);
    bass.play(1/8, D3, 1/8);
    bass.play(1/4, D3, 1/16);
    bass.play(5/16, D3, 1/16);
    bass.play(7/16, D3, 1/8);
    bass.play(9/16, D3, 1/8);
    bass.play(11/16, D3, 1/16);
    bass.play(12/16, D3, 1/16);
    bass.play(13/16, D3, 1/16);
    bass.play(14/16, D3, 1/8);
    
    sineTooth.play(1+0, C4, 1/16);
    sineTooth.play(1+0, G4, 1/16);
    sineTooth.play(1+1/16, C4, 1/16);
    sineTooth.play(1+1/16, G4, 1/16);
    sineTooth.play(1+1/8, D5, 1/8);
    sineTooth.play(1+1/4, A4, 3/16);
    sineTooth.play(1+7/16, Gs4, 1/8);
    sineTooth.play(1+9/16, G4, 1/8);
    sineTooth.play(1+11/16, F4, 1/8);
    sineTooth.play(1+13/16, D4, 1/16);
    sineTooth.play(1+14/16, F4, 1/16);
    sineTooth.play(1+15/16, G4, 1/16);
    
    bass.play(1+0, C3, 1/8);
    bass.play(1+1/8, C3, 1/8);
    bass.play(1+1/4, C3, 1/16);
    bass.play(1+5/16, C3, 1/16);
    bass.play(1+7/16, C3, 1/8);
    bass.play(1+9/16, C3, 1/8);
    bass.play(1+11/16, C3, 1/16);
    bass.play(1+12/16, C3, 1/16);
    bass.play(1+13/16, C3, 1/16);
    bass.play(1+14/16, C3, 1/8);
    
    sineTooth.play(2+0, B3, 1/16);
    sineTooth.play(2+0, Fs4, 1/16);
    sineTooth.play(2+1/16, B3, 1/16);
    sineTooth.play(2+1/16, Fs4, 1/16);
    sineTooth.play(2+1/8, D5, 1/8);
    sineTooth.play(2+1/4, A4, 3/16);
    sineTooth.play(2+7/16, Gs4, 1/8);
    sineTooth.play(2+9/16, G4, 1/8);
    sineTooth.play(2+11/16, F4, 1/8);
    sineTooth.play(2+13/16, D4, 1/16);
    sineTooth.play(2+14/16, F4, 1/16);
    sineTooth.play(2+15/16, G4, 1/16);
    
    bass.play(2+0, B2, 1/8);
    bass.play(2+1/8, B2, 1/8);
    bass.play(2+1/4, B2, 1/16);
    bass.play(2+5/16, B2, 1/16);
    bass.play(2+7/16, B2, 1/8);
    bass.play(2+9/16, B2, 1/8);
    bass.play(2+11/16, B2, 1/16);
    bass.play(2+12/16, B2, 1/16);
    bass.play(2+13/16, B2, 1/16);
    bass.play(2+14/16, B2, 1/8);
    
    sineTooth.play(3+0, As3, 1/16);
    sineTooth.play(3+0, F4, 1/16);
    sineTooth.play(3+1/16, As3, 1/16);
    sineTooth.play(3+1/16, F4, 1/16);
    sineTooth.play(3+1/8, D5, 1/8);
    sineTooth.play(3+1/4, A4, 3/16);
    sineTooth.play(3+7/16, Gs4, 1/8);
    sineTooth.play(3+9/16, G4, 1/8);
    sineTooth.play(3+11/16, F4, 1/8);
    sineTooth.play(3+13/16, D4, 1/16);
    sineTooth.play(3+14/16, F4, 1/16);
    sineTooth.play(3+15/16, G4, 1/16);
    
    bass.play(3+0, As2, 1/8);
    bass.play(3+1/8, As2, 1/8);
    bass.play(3+1/4, As2, 1/16);
    bass.play(3+5/16, As2, 1/16);
    bass.play(3+7/16, C3, 1/8);
    bass.play(3+9/16, C3, 1/8);
    bass.play(3+11/16, C3, 1/16);
    bass.play(3+12/16, C3, 1/16);
    bass.play(3+13/16, C3, 1/16);
    bass.play(3+14/16, C3, 5);
    
    //trumpet.play(4, D4, 1);
    
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
    
    bassDrum.play(3+0);
    bassDrum.play(3+1/16);
    snareDrum.play(3+2/16);
    bassDrum.play(3+3/16);
    snareDrum.play(3+4/16);
    snareDrum.play(3+6/16);
    snareDrum.play(3+8/16);*/
    
    

    // Increasing speed drum pattern
    //slider.play(0, A2, A4 * 2, 0, 0.2, 3.75);
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