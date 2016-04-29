var songBuilder = (function() {
    var measuresPerSegment = 16;
    function build()  {
        // Start by building the form of the song (e.g. AABA)
        // A "rule" is a function that determines the probability of getting to each state from the current state.
        // It returns a stateMap, which is an array of probabilities for each state.
        var formRule = function (prevStates) {
            // state is a 0-based number
            if (equals(prevStates, []))
                return [1];
            if (equals(prevStates, [0]))
                return [0.5, 0.5];
            if (equals(prevStates, [0, 0]))
                return [0, 1];
            if (equals(prevStates, [0, 1]))
                return [0.9, 0, 0.1];
            if (equals(prevStates, [0, 0, 1]))
                return [0.8, 0, 0.2];
            if (equals(prevStates, [0, 1, 0]))
                return [0, 0.9, 0.1];
            if (equals(prevStates, [0, 1, 2]))
                return [0.8, 0.2, 0];
            if (prevStates.length === 6 && prevStates.indexOf(2) === -1)
                return [0, 0, 1]; // Ensure that the C section happens at least once
            if (prevStates.length < 2)
                return [1];
            var recentStates = prevStates.slice(prevStates.length - 2, prevStates.length);
            if (equals(recentStates, [0, 0]))
                return [0, 1];
            if (equals(recentStates, [0, 1]))
                return [0.3, 0, 0.7];
            if (equals(recentStates, [0, 2]))
                return [1];
            if (equals(recentStates, [1, 0]))
                return [0, 0.6, 0.4];
            if (equals(recentStates, [1, 2]))
                return [1];
            if (equals(recentStates, [2, 0]))
                return [0.1, 0.8, 0.1];
            return [1];
        }
        var form = markovChain.build(formRule, 8);
        
        var segments = [];
        for (var i = 0; i < 3; ++i) {
            segments.push({});
        }
        
        // Generate a chord progression (0=C, 1=Dm, 2=Em, 3=F, etc.)
        var chordRule = function (prevStates) {
            // Data from http://www.hooktheory.com/trends#node=1&key=C
            // Always start with the root chord (C)
            if (equals(prevStates, []))
                return [1];
            if (equals(prevStates, [0]))
                return [0, 0.09, 0, 0.28, 0.48, 0.15, 0];
            if (equals(prevStates, [0, 1]))
                return [0.18, 0, 0.18, 0.20, 0.14, 0.30, 0];
            if (equals(prevStates, [0, 1, 0]))
                return [0, 0.54, 0, 0.18, 0.22, 0.06, 0];
            if (equals(prevStates, [0, 1, 2]))
                return [0, 0, 0, 0.8, 0, 0.2, 0];
            if (equals(prevStates, [0, 1, 3]))
                return [0, 0, 0, 0, 0.67, 0.33, 0];
            if (equals(prevStates, [0, 1, 4]))
                return [0.35, 0, 0, 0, 0.45, 0.2, 0];
            if (equals(prevStates, [0, 1, 5]))
                return [0.5, 0, 0, 0.2, 0, 0.3, 0];
            if (equals(prevStates, [0, 3]))
                return [0.4, 0, 0, 0, 0.4, 0.2, 0];
            if (equals(prevStates, [0, 3, 0]))
                return [0, 0, 0, 0.6, 0.4, 0, 0];
            if (equals(prevStates, [0, 3, 4]))
                return [0.4, 0, 0, 0.2, 0, 0.4, 0];
            if (equals(prevStates, [0, 3, 5]))
                return [0.1, 0, 0, 0.2, 0.7, 0, 0];
            if (equals(prevStates, [0, 4]))
                return [0.2, 0.1, 0, 0.3, 0, 0.4, 0];
            if (equals(prevStates, [0, 4, 0]))
                return [0, 0, 0, 0.5, 0.5, 0, 0];
            if (equals(prevStates, [0, 4, 1]))
                return [0, 0, 0, 0.7, 0, 0.3, 0];
            if (equals(prevStates, [0, 4, 3]))
                return [0.5, 0, 0, 0, 0.25, 0.25, 0];
            if (equals(prevStates, [0, 4, 5]))
                return [0, 0, 0, 0.8, 0.2, 0, 0];
            if (equals(prevStates, [0, 5]))
                return [0.15, 0, 0, 0.45, 0.35, 0, 0];
            if (equals(prevStates, [0, 5, 0]))
                return [0, 0, 0, 0.3, 0.1, 0.6, 0];
            if (equals(prevStates, [0, 5, 3]))
                return [0.5, 0, 0, 0, 0.5, 0, 0];
            if (equals(prevStates, [0, 5, 4]))
                return [0.2, 0.1, 0, 0.7, 0, 0, 0];
        }
        for (var i = 0; i < segments.length; ++i) {
            segments[i].chordProgression = markovChain.build(chordRule, 4);
        }
        
        // Generate rhythms for each section
        var rhythmRule = function (beat) {
            switch (beat % 4) {
                case 0:
                    return [
                        { value: { duration: 0.5 }, probability: 0.1 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.2 },
                        { value: { duration: 1, isRest: true }, probability: 0.3 },
                        { value: { duration: 1.5 }, probability: 0.1 },
                    ];
                case 0.5:
                    return [
                        { value: { duration: 0.5 }, probability: 0.4 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.1 },
                        { value: { duration: 1, isRest: true }, probability: 0.2 },
                    ];
                case 1:
                    return [
                        { value: { duration: 0.5 }, probability: 0.4 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.1 },
                        { value: { duration: 1, isRest: true }, probability: 0.2 },
                    ];
                case 1.5:
                    return [
                        { value: { duration: 0.5 }, probability: 0.7 },
                        { value: { duration: 1.5 }, probability: 0.3 },
                    ];
                case 2:
                    return [
                        { value: { duration: 0.5 }, probability: 0.4 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.1 },
                        { value: { duration: 1, isRest: true }, probability: 0.2 },
                    ];
                case 2.5:
                    return [
                        { value: { duration: 0.5 }, probability: 0.4 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.1 },
                        { value: { duration: 1, isRest: true }, probability: 0.2 },
                    ];
                case 3:
                    return [
                        { value: { duration: 0.5 }, probability: 0.4 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.3 },
                        { value: { duration: 1 }, probability: 0.1 },
                        { value: { duration: 1, isRest: true }, probability: 0.2 },
                    ];
                case 3.5:
                    return [
                        { value: { duration: 0.5 }, probability: 0.5 },
                        { value: { duration: 0.5, isRest: true }, probability: 0.5 },
                    ];
                default:
                    return [
                        { value: { duration: 1 }, probability: 1 },
                    ];
            }
        }
        for (var i = 0; i < segments.length; ++i) {
            segments[i].rhythm = markovChain.buildRhythm(rhythmRule, measuresPerSegment);
        }
        
        // Generate a sequence of notes for each segment (0=A, 1=B, 2=C)
        var pitchRule = function (prevNote, currentBeat, chord) {
            // prevNote is a numeric value representing a note in a scale (0=Do, 1=Re, 2=Mi, etc.)
            // Start with numbers representing the note in the current chord.
            var stateMap;
            var prevNoteInChord = prevNote - chord;
            switch (prevNoteInChord) {
                case -6:
                case -5:
                case -4:
                case -3:
                case -2:
                case -1:
                case 0:
                case 1:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            // Ensure that strong beats land on 1, 3, or 5 in the chord
                            stateMap = [0.6, 0, 0.3, 0, 0.1, 0, 0, 0];
                            break;
                        default:
                            stateMap = [0.3, 0.4, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0];
                            break;
                    }
                    break;
                case 2:
                case 3:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            // Ensure that strong beats land on 1, 3, or 5 in the chord
                            stateMap = [0.1, 0, 0.3, 0, 0.6, 0, 0, 0];
                            break;
                        default:
                            stateMap = [0.0, 0.2, 0.2, 0.2, 0.4, 0.0, 0.0, 0.0];
                            break;
                    }
                case 4:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            stateMap = [0.0, 0, 0.2, 0, 0.8, 0, 0, 0];
                            break;
                        default:
                            stateMap = [0.0, 0.1, 0.2, 0.3, 0.2, 0.2, 0.0, 0.0];
                            break;
                    }
                    break;
                case 5:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            stateMap = [0.0, 0, 0, 0, 0.9, 0, 0, 0.1];
                            break;
                        default:
                            stateMap = [0.0, 0.0, 0.2, 0.3, 0.4, 0.0, 0.1, 0.0];
                            break;
                    }
                    break;
                case 6:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            stateMap = [0, 0, 0, 0, 0.2, 0, 0, 0.8];
                            break;
                        default:
                            stateMap = [0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.1, 0.5];
                            break;
                    }
                    break;
                default:
                    switch (currentBeat % 4) {
                        case 0:
                        case 0.5:
                        case 2:
                        case 2.5:
                            stateMap = [0.0, 0, 0.0, 0, 0.2, 0, 0, 0.8];
                            break;
                        default:
                            stateMap = [0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.6, 0.3];
                            break;
                    }
                    break;
            }
            // Translate the stateMap to actual notes based on the current chord
            for (var i = 0; i < chord; ++i)
                stateMap.unshift(0);
            return stateMap;
        }
        for (var i = 0; i < segments.length; ++i) {
            var segment = segments[i];
            segment.notes = markovChain.buildNotes(pitchRule, segment.rhythm, segment.chordProgression);
        }
        
        return {
            form: form,
            segments: segments,
        };
    }
    
    function run(song)  {
        // C4-B4
        var frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77];
        var currentBeat = 0;
        // Add bass drum
        var bassDrum = new BassDrum(context, 75 + 20 * masteries['braum'], 0.1 + 0.1 * masteries['malphite']);
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            for (var j = 0; j < measuresPerSegment; ++j) {
                // Play bass drum on 1 and 3
                bassDrum.play(currentBeat / BEATS_PER_BAR);
                bassDrum.play((currentBeat + 2)  / BEATS_PER_BAR);
                currentBeat += 4;
            }
        }
        console.log(currentBeat);
        // Add bass line
        currentBeat = 0;
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            for (var j = 0; j < measuresPerSegment; ++j) {
                var chord = segment.chordProgression[j % segment.chordProgression.length];
                // Play the root note of the chord for 1 bar
                var frequency = frequencies[chord] / 2;
                playFrequency(frequency, currentBeat * SECONDS_PER_BEAT + songStartTime, SECONDS_PER_BAR);
                currentBeat += BEATS_PER_BAR;
            }
        }
        console.log(currentBeat);
        // Add melody
        currentBeat = 0;
        for (var i = 0; i < song.form.length; ++i) {
            var segment = song.segments[song.form[i]];
            for (var j = 0; j < segment.notes.length; ++j) {
                var rhythm = segment.rhythm[j];
                if (!rhythm.isRest) {
                    var note = segment.notes[j];
                    playFrequency(frequencies[note], currentBeat * SECONDS_PER_BEAT + songStartTime, rhythm.duration * SECONDS_PER_BEAT);
                }
                currentBeat += rhythm.duration;
            }
        }
        console.log(currentBeat);
    }
    
    function buildAndRun()  {
        var song = build();
        run(song);
    }
    
    return {
        build: build,
        run: run,
        buildAndRun: buildAndRun,
    }
})();