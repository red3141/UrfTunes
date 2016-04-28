var SongBuilder = (function() {
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
        var form = new MarkovChain(formRule, 8);
        
        // Now generate a chord progression
        var chordRule = function (prevStates) {
            // Data from http://www.hooktheory.com/trends#node=1&key=C
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
        var chordProgressions = [];
        var chordProgressionLength = 4;
        for (var i = 0; i < 3; ++i) {
            chordProgressions[i] = new MarkovChain(chordRule, chordProgressionLength);
        }
        
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