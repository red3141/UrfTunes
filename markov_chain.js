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
        if (i === stateMap.length - 1 && cum < 1)
            console.warn('Bad rule (does not add to 1): [' + stateMap.join(',') + ']');
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
        if (i === stateMap.length && cum < 1)
            console.warn('Bad rule (does not add to 1): [' + stateMap.join(',') + ']');
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
        var firstTimeRhythms = [];
        var prevRhythm = { duration: 0 };
        var i2 = 0;
        while (currentMeasure < measures) {
            var currentGroup = Math.floor(currentMeasure / 4);
            var rhythm;
            if (currentGroup === 0 || currentGroup === 2 || (currentMeasure % 4) >= 2) {
                var stateMap = rule(beatInMeasure, currentMeasure, prevRhythm);
                rhythm = getNextStateComplex(stateMap, prng());
            } else {
                // Use repetition
                rhythm = firstTimeRhythms[i2];
            }
            rhythms.push(rhythm);
            beatInMeasure += rhythm.duration;
            ++i2;
            while (beatInMeasure >= 4 - 1e-2) {
                beatInMeasure -= 4;
                ++currentMeasure;
                if (currentMeasure % 4 === 0)
                    i2 = 0;
            }
            if (currentMeasure < 4)
                firstTimeRhythms.push(rhythm);
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
        //var notes = [];
        var firstTimeNotes = [];
        var i2 = 0;
        for (var i = 0; i < rhythm.length; ++i) {
            var currentGroup = Math.floor(currentMeasure / 4);
            var note;
            if (rhythm[i].isRest) {
                note = -1;
            } else {
                if (currentGroup === 0 || currentGroup === 2 || (currentMeasure % 4) >= 2) {
                    // Generate note
                    // For now assume that each chord is one measure long
                    var chord = chordProgression[currentMeasure % chordProgression.length];
                    var stateMap = rule(prevNote, beatInMeasure, currentMeasure, chord);
                    note = getNextState(stateMap, prng());
                } else {
                    // Use repetition
                    note = firstTimeNotes[i2];
                    if (note < 0)
                        console.warn('Bad repeated note!');
                }
                prevNote = note;
            }
            rhythm[i].note = note;
            if (currentMeasure < 4)
                firstTimeNotes[i] = note;
            beatInMeasure += rhythm[i].duration;
            ++i2;
            while (beatInMeasure >= 4 - 1e-2) {
                beatInMeasure -= 4;
                ++currentMeasure;
                if (currentMeasure % 4 === 0)
                    i2 = 0;
            }
        }
        //return notes;
    }
    
    return {
        build: build,
        buildRhythm: buildRhythm,
        buildNotes: buildNotes,
    };
})();
