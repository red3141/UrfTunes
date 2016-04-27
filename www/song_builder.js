var SongBuilder = (function() {
    function build()  {
        // Start by building the form of the song (e.g. AABA)
        // A "rule" is a function that determines the probability of getting to each state from the current state.
        // It returns a stateMap, which is an array of probabilities for each state.
        var formRule = function (state, index, length) {
            // state is a 0-based number
            if (index == 0)
                return [1];
            switch (state) {
                case 0:
                    // 40% chance of going to state 0, 50% to state 2, 10% to state 3
                    return [.4, .5, .1];
                case 1:
                    return [.4, 0, .6];
                default:
                    return [.9, .1, 0];
            }
        }
        var form = new MarkovChain(formRule, 6);
        
        // Now generate a sequence of notes for each segment of song (0=A, 1=B, 2=C)
        var pitchRule = function (state, index, length) {
            // States are notes in a scale (0=Do, 1=Re, 2=Mi, etc.)
            switch (state) {
                case 0:
                    return [0.05, 0.3, 0.2, 0.15, 0.1, 0.1, 0.1];
                case 1:
                    return [0.2, 0.05, 0.3, 0.15, 0.1, 0.1, 0.1];
                case 2:
                    return [0.15, 0.3, 0.05, 0.2, 0.1, 0.1, 0.1];
                case 3:
                    return [0.1, 0.15, 0.2, 0.05, 0.3, 0.1, 0.1];
                case 4:
                    return [0.1, 0.1, 0.1, 0.2, 0.05, 0.3, 0.15];
                case 5:
                    return [0.1, 0.1, 0.1, 0.15, 0.2, 0.05, 0.3];
                default:
                    return [0.1, 0.1, 0.1, 0.15, 0.2, 0.3, 0.05];
            }
        }
        var segments = [];
        var segmentLength = 8;
        for (var i = 0; i < 3; ++i) {
            segments[i] = new MarkovChain(pitchRule, segmentLength);
        }
        var notes = [];
        for (var i = 0; i < form.states.length; ++i) {
            var segmentNumber = form.states[i];
            notes.push.apply(notes, segments[segmentNumber].states);
        }
        return notes;
    }
    
    function run(song)  {
        // C4-B4
        var frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        var tempo = 120 // beats per minute
        var quarterNoteDuration = 60 / tempo;
        for (var i = 0; i < song.length; ++i) {
            var note = song[i];
            playFrequency(frequencies[note], quarterNoteDuration * i, quarterNoteDuration);
        }
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