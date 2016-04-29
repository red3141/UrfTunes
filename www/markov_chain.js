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
    
    function build(rule, length) {
        // Build the chain of states
        var state = 0;
        var states = [];
        for (var i = 0; i < length; ++i) {
            var stateMap = rule(states);
            // Use RNG for now
            // TODO: get rid of RNG and use champion mastery data to decide the next state
            state = getNextState(stateMap, Math.random());
            states[i] = state;
        }
        return states;
    }
    
    function buildRhythm(rule, measures) {
        var beatsPerMeasure = 4; // Always use 4/4 time
        var state = 0;
        var currentBeat = 0;
        var currentMeasure = 0;
        var rhythms = [];
        while (currentMeasure < measures) {
            var stateMap = rule(currentBeat);
            // Use RNG for now
            // TODO: get rid of RNG and use champion mastery data to decide the next state
            rhythm = getNextStateComplex(stateMap, Math.random());
            rhythms.push(rhythm);
            currentBeat += rhythm.duration;
            if (currentBeat >= 4 - 1e-2) {
                currentBeat = 0;
                ++currentMeasure;
            }
        }
        return rhythms;
    }
    
    function buildNotes(rule, rhythm, chordProgression) {
        var beatsPerMeasure = 4; // Always use 4/4 time
        var prevNote = 0;
        var currentBeat = 0;
        var currentMeasure = 0;
        var notes = [];
        for (var i = 0; i < rhythm.length; ++i) {
            if (rhythm[i].isRest) {
                notes[i] = -1;
            } else {
                // For now assume that each chord is one measure long
                var chord = chordProgression[currentMeasure % chordProgression.length];
                
                var stateMap = rule(prevNote, currentBeat, chord);
                // Use RNG for now
                // TODO: get rid of RNG and use champion mastery data to decide the next state
                notes[i] = getNextState(stateMap, Math.random());
                if (notes[i] == 6 && ((currentBeat % 4) == 0 || (currentBeat % 4) == 2))
                {
                    console.log("bleh");
                }
                prevNote = notes[i];
                currentBeat += rhythm[i].duration;
                if (currentBeat >= 4 - 1e-2) {
                    currentBeat = 0;
                    ++currentMeasure;
                }
            }
        }
        return notes;
    }
    
    return {
        build: build,
        buildRhythm: buildRhythm,
        buildNotes: buildNotes,
    };
})();
