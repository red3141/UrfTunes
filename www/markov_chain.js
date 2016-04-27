function MarkovChain(rule, length) {
    // A stateMap is an array that defines how likely is to get to each possible state from the current state.
    function getNextState(stateMap, n) {
        var i = 0;
        var cum = stateMap[0];
        while (i < stateMap.length - 1 && cum <= n) {
            ++i;
            cum += stateMap[i];
        }
        return i;
    }
    // Build the chain of states
    var state = 0;
    this.states = [];
    for (var i = 0; i < length; ++i) {
        var stateMap = rule(state, i, length);
        // Use RNG for now
        // TODO: get rid of RNG and use champion mastery data to decide the next state
        state = getNextState(stateMap, Math.random());
        this.states[i] = state;
    }
}
