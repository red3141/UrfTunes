var songBuilder = (function(seedrandom) {
    var context;
    var currentSong;
    var currentInstruments = [];
    var measuresPerSegment = 16;
    function build()  {
        var formSeedInputs = ['aatrox', 'ahri', 'akali', 'alistar', 'amumu', 'anivia', 'annie', 'ashe', 'aurelionsol', 'azir', 'bard', 'blitzcrank', 'brand', 'braum', 'caitlyn', 'cassiopeia', 'chogath', 'corki', 'darius', 'diana', 'drmundo', 'draven', 'ekko', 'elise', 'evelynn', 'ezreal', 'fiddlesticks', 'fiora', 'fizz', 'galio', 'gangplank', 'garen', 'gnar', 'gragas', 'graves', 'hecarim', 'heimerdinger', 'illaoi', 'irelia', 'janna', 'jarvaniv'];
        var prng = seedrandom(getSeed(formSeedInputs), { global: false });
        // Start by building the form of the song (e.g. AABA)
        // A "rule" is a function that determines the probability of getting to each state from the current state.
        // It returns a stateMap, which is an array of probabilities for each state.
        var form = markovChain.build(formRule, 8, prng);
        
        var segments = [];
        for (var i = 0; i < 3; ++i) {
            segments.push({});
        }
        
        var bassSeedInputs = ['jax',
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
            'nunu'];
        prng = seedrandom(getSeed(bassSeedInputs), { global: false });
        // Generate a chord progression (0=C, 1=Dm, 2=Em, 3=F, etc.)
        for (var i = 0; i < segments.length; ++i) {
            segments[i].chordProgression = markovChain.build(chordRule, 4, prng);
        }
        
        // Generate rhythms for each section
        for (var i = 0; i < segments.length; ++i) {
            segments[i].bassLineRhythm = markovChain.buildRhythm(bassLineRhythmRule, 2, prng);
        }
        
        var melodySeedInputs = ['olaf',
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
            'tryndamere'];
        prng = seedrandom(getSeed(melodySeedInputs), { global: false });
        
        // Generate rhythms for each section
        for (var i = 0; i < segments.length; ++i) {
            var rhythm = markovChain.buildRhythm(melodyRhythmRule, 4, prng);
            rhythm = rhythm.concat(rhythm).concat(rhythm).concat(rhythm);
            segments[i].melodyRhythm = rhythm;
        }
        
        // Generate a sequence of notes for each segment
        for (var i = 0; i < segments.length; ++i) {
            var segment = segments[i];
            segment.notes = markovChain.buildNotes(melodyPitchRule, segment.melodyRhythm, segment.chordProgression, prng);
        }
        
        // Make an ending
        // For now just play a double whole note
        var lastForm = form[form.length - 1];
        var lastSegment = segments[lastForm];
        var lastNote = lastSegment.notes[lastSegment.notes.length - 1];
        var octaveShift = 0;
        while (lastNote > 7) {
            lastNote -= 7;
            ++octaveShift;
        }
        var endingNote;
        switch (lastNote) {
            case 0:
            case 1:
            case 2:
                endingNote = 0;
                break;
            case 3:
            case 4:
                endingNote = 4;
                break;
            default:
                endingNote = 7;
                break;
        }
        
        var ending = {
            chordProgression: [0],
            bassLineRhythm: [{ duration: 8 }],
            melodyRhythm: [{ duration: 8 }],
            notes: [endingNote],
        }
        
        return {
            form: form,
            segments: segments,
            ending: ending,
        };
    }
    
    function getSeed(inputs) {
        var s = '';
        for (var i = 0; i < inputs.length; ++i)
            s += masteries[inputs[i]];
        return s;
    }
    
    function play(song)  {
        song = song || currentSong;
        currentInstruments = [];
        // C4-B5
        var frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77];
        if (context)
            context.close();
        context = new AudioContext();
        
        var beatsPerBar = 4 // Use 4/4 time
        var beatsPerMinute = 180 + 1.5 * (masteries['hecarim'] + masteries['masteryi'] + masteries['rammus'] + masteries['zilean']);
        var secondsPerBeat = 60.0 / beatsPerMinute;
        var currentBeat = 0;
        var currentTime = 0;
        
        var bassDrum = new BassDrum(context);
        var snareDrum = new SnareDrum(context);
        var bassInstrument = new Bass(context);
        var melodyInstrument = new SineTooth(context);
        
        // Intro
        /* Options:
          - SineTooth note only
          - Basic: start with bottom instruments and build up
          - Start with melody instrument only and add supporting lines later
          - Piano intro that transitions to electro
          - String ensemble that transitions to electro
          - Low bass note followed by drums
        */
        var introLength = 32;
        for (var i = 0; i < introLength; ++i) {
            // Play bass drum on 1 and 3
            if (i % 2 === 0)
                bassDrum.play(currentTime);
            if (currentBeat >= 16 && i % 4 === 2)
                snareDrum.play(currentTime);
            ++currentBeat;
            currentTime = currentBeat * secondsPerBeat;
        }
        currentBeat = 0;
        currentTime = 0;
        var j = 0;
        var segment = song.segments[0];
        var measure = 0;
        var beatInMeasure = 0;
        while (currentBeat < introLength) {
            var rhythm = segment.bassLineRhythm[j % segment.bassLineRhythm.length];
            if (!rhythm.isRest) {
                // Play the root note of the chord
                var chord = segment.chordProgression[measure % segment.chordProgression.length];
                var frequency = frequencies[chord] / 4;
                bassInstrument.play(currentTime, frequency, rhythm.duration * secondsPerBeat);
            }
            currentBeat += rhythm.duration;
            beatInMeasure += rhythm.duration;
            currentTime = currentBeat * secondsPerBeat;
            while (beatInMeasure >= beatsPerBar) {
                ++measure;
                beatInMeasure -= beatsPerBar;
            }
            ++j;
        }
        
        // Body
        var bodyStartTime = currentTime;
        currentBeat = 0;
        currentTime = bodyStartTime;
        // Add drums
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            for (var j = 0; j < measuresPerSegment; ++j) {
                // Play bass drum on 1 and 3
                bassDrum.play(currentTime);
                bassDrum.play(currentTime + 2 * secondsPerBeat);
                // Snare on 3
                snareDrum.play(currentTime + 2 * secondsPerBeat);
                currentBeat += beatsPerBar;
                currentTime = currentBeat * secondsPerBeat + bodyStartTime;
            }
        }
        console.log(currentBeat);
        
        // Add bass line
        currentBeat = 0;
        currentTime = bodyStartTime;
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            var measure = 0;
            var beatInMeasure = 0;
            var j = 0;
            while (measure < measuresPerSegment) {
                var rhythm = segment.bassLineRhythm[j % segment.bassLineRhythm.length];
                if (!rhythm.isRest) {
                    // Play the root note of the chord
                    var chord = segment.chordProgression[measure % segment.chordProgression.length];
                    var frequency = frequencies[chord] / 4;
                    bassInstrument.play(currentTime, frequency, rhythm.duration * secondsPerBeat);
                }
                currentBeat += rhythm.duration;
                beatInMeasure += rhythm.duration;
                currentTime = currentBeat * secondsPerBeat + bodyStartTime;
                while (beatInMeasure >= beatsPerBar) {
                    ++measure;
                    beatInMeasure -= beatsPerBar;
                }
                ++j;
            }
        }
        console.log(currentBeat);
        
        // Add melody
        currentBeat = 0;
        currentTime = bodyStartTime;
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            for (var j = 0; j < segment.notes.length; ++j) {
                var rhythm = segment.melodyRhythm[j];
                if (!rhythm.isRest) {
                    var note = segment.notes[j];
                    melodyInstrument.play(currentTime, frequencies[note], rhythm.duration * secondsPerBeat);
                }
                currentBeat += rhythm.duration;
                currentTime = currentBeat * secondsPerBeat + bodyStartTime;
            }
        }
        console.log(currentBeat);
        
        // Add ending
        var endingStartTime = currentTime + bodyStartTime;
        currentBeat = 0;
        currentTime = endingStartTime;
        for (var j = 0; j < song.ending.notes.length; ++j) {
            var rhythm = song.ending.melodyRhythm[j];
            if (!rhythm.isRest) {
                var note = song.ending.notes[j];
                melodyInstrument.play(currentTime, frequencies[note], rhythm.duration * secondsPerBeat);
            }
            currentBeat += rhythm.duration;
            currentTime = currentBeat * secondsPerBeat + endingStartTime;
        }
        var endingLength = currentBeat;
        currentBeat = 0;
        currentTime = endingStartTime;
        measure = 0;
        var j = 0;
        while (measure * beatsPerBar < endingLength) {
            var rhythm = song.ending.bassLineRhythm[j % song.ending.bassLineRhythm.length];
            if (!rhythm.isRest) {
                // Play the root note of the chord
                var chord = song.ending.chordProgression[measure % song.ending.chordProgression.length];
                var frequency = frequencies[chord] / 4;
                bassInstrument.play(currentTime, frequency, rhythm.duration * secondsPerBeat);
            }
            currentBeat += rhythm.duration;
            beatInMeasure += rhythm.duration;
            currentTime = currentBeat * secondsPerBeat + endingStartTime;
            while (beatInMeasure >= beatsPerBar) {
                ++measure;
                beatInMeasure -= beatsPerBar;
            }
            ++j;
        }
        
    }
    
    function buildAndPlay()  {
        var song = build();
        currentSong = song;
        play(song);
    }
    
    function stop()  {
        if (!context)
            return;
        context.close();
        context = null;
    }

    currentSong = build();
    
    return {
        build: build,
        play: play,
        buildAndPlay: buildAndPlay,
        stop: stop,
    }
})(
    Math.seedrandom
    //function mockSeedRandom() { return Math.random; }
);