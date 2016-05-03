var markovChain = (function() {
    // A stateMap is an array that defines how likely is to get to each possible state from the current state.
    function getNextState(stateMap, n) {
        if (!stateMap || !stateMap.length)
            return 0;
        var i = 0;
        var cum = stateMap[0];
        while (i < stateMap.length - 1 && cum <= n) {
            ++i;
            cum += stateMap[i];
        }
        return i;
    }
    
    function getNextStateComplex(stateMap, n) {
        if (!stateMap || !stateMap.length)
            return 0;
        var i = 0;
        var currentState;
        var cum = 0;
        do {
            currentState = stateMap[i];
            cum += currentState.probability;
            ++i;
        } while (i < stateMap.length && cum <= n);
        return currentState.value;
    }
    
    function build(rule, length, prng) {
        prng = prng || Math.random;
        // Build the chain of states
        var state = 0;
        var states = [];
        for (var i = 0; i < length; ++i) {
            var stateMap = rule(states);
            state = getNextState(stateMap, prng());
            states[i] = state;
        }
        return states;
    }
    
    function buildRhythm(rule, measures, prng) {
        rule = rule || function() { return [{ value: { duration: 1 }, probability: 1 }] };
        prng = prng || Math.random;
        var beatsPerMeasure = 4; // Always use 4/4 time
        var state = 0;
        var beatInMeasure = 0;
        var currentMeasure = 0;
        var rhythms = [];
        var prevRhythm = { duration: 0 };
        while (currentMeasure < measures) {
            var stateMap = rule(beatInMeasure, currentMeasure, prevRhythm);
            rhythm = getNextStateComplex(stateMap, prng());
            rhythms.push(rhythm);
            beatInMeasure += rhythm.duration;
            while (beatInMeasure >= 4 - 1e-2) {
                beatInMeasure -= 4;
                ++currentMeasure;
            }
            prevRhythm = rhythm;
        }
        return rhythms;
    }
    
    function buildNotes(rule, rhythm, chordProgression, prng) {
        prng = prng || Math.random;
        var beatsPerMeasure = 4; // Always use 4/4 time
        var prevNote = 0;
        var beatInMeasure = 0;
        var currentMeasure = 0;
        var notes = [];
        var firstTimeNotes = [];
        var i2 = 0;
        for (var i = 0; i < rhythm.length; ++i) {
            if (rhythm[i].isRest) {
                notes[i] = -1;
            } else {
                var currentGroup = Math.floor(currentMeasure / 4);
                if (currentGroup == 0 || currentGroup == 2 || (currentMeasure % 4) >= 2) {
                    // Generate note
                    // For now assume that each chord is one measure long
                    var chord = chordProgression[currentMeasure % chordProgression.length];
                    var stateMap = rule(prevNote, beatInMeasure, chord);
                    notes[i] = getNextState(stateMap, prng());
                } else {
                    // Use repetition
                    notes[i] = firstTimeNotes[i2];
                }
                prevNote = notes[i];
            }
            if (currentMeasure < 4)
                firstTimeNotes[i] = notes[i];
            beatInMeasure += rhythm[i].duration;
            while (beatInMeasure >= 4 - 1e-2) {
                beatInMeasure -= 4;
                ++currentMeasure;
            }
            ++i2;
            if (currentMeasure >= 4 && i2 >= firstTimeNotes.length)
                i2 = 0;
        }
        return notes;
    }
    
    return {
        build: build,
        buildRhythm: buildRhythm,
        buildNotes: buildNotes,
    };
})();
