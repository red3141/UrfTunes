// The rules to use for building various types of Markov chains
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

// Rhythm rules
var bassLineRhythmRule = function (beat, measure, prevRhythm) {
    switch (beat) {
        case 0:
            return [
                { value: { duration: 0.5 }, probability: 0.1 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.2 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1.5 }, probability: 0.1 },
            ];
        case 0.5:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 1:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 1.5:
            return [
                { value: { duration: 0.5 }, probability: 0.7 },
                { value: { duration: 1.5 }, probability: 0.3 },
            ];
        case 2:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 2.5:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 3:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 3.5:
            return [
                { value: { duration: 0.5 }, probability: 0.5 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.5 },
            ];
        default:
            return [
                { value: { duration: 1 }, probability: 1 },
            ];
    }
}
var introRhythmRule = function (beat, measure, prevRhythm) {
    if (measure === 0)
        return  [{ value: { duration: 0.5 }, probability: 1 }];
    
    switch (beat) {
        case 0.5:
        case 1.5:
        case 2.5:
        case 3.5:
            return [
                { value: { duration: 0.5 }, probability: 0.7 },
                { value: { duration: 0.5, isRest: true }, probability: 0.3 },
            ];
        default:
            return  [
                { value: { duration: 0.5 }, probability: 1 }
            ];
    }
}
var melodyRhythmRule = function (beat, measure, prevRhythm) {
    switch (beat) {
        case 0:
            return [
                { value: { duration: 0.5 }, probability: 0.1 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1.5 }, probability: 0.2 },
            ];
        case 0.5:
            return [
                { value: { duration: 0.5 }, probability: 0.6 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.2 },
                { value: { duration: 1.5 }, probability: 0.2 },
                { value: { duration: 1.5, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 1:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 1.5:
            return [
                { value: { duration: 0.5 }, probability: 0.5 },
                { value: { duration: 1 }, probability: 0.2 },
                { value: { duration: 1.5 }, probability: 0.3 },
            ];
        case 2:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 2.5:
            return [
                { value: { duration: 0.5 }, probability: 0.5 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
                { value: { duration: 1 }, probability: 0.1 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.1 },
            ];
        case 3:
            return [
                { value: { duration: 0.5 }, probability: 0.4 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.2 },
                { value: { duration: 1 }, probability: 0.2 },
                { value: { duration: 1, isRest: !prevRhythm.isRest }, probability: 0.2 },
            ];
        case 3.5:
            return [
                { value: { duration: 0.5 }, probability: 0.7 },
                { value: { duration: 0.5, isRest: !prevRhythm.isRest }, probability: 0.3 },
            ];
        default:
            return [
                { value: { duration: 1 }, probability: 1 },
            ];
    }
}

function getBackgroundRule(level) {
    var duration;
    switch (level) {
        case 5:
            duration = 1.5;
            break;
        case 4:
            duration = 2.5;
            break;
        case 3:
            duration = 3;
            break;
        case 2:
            duration = 4;
            break;
        default:
            duration = 6;
            break;
    }
    return function (beat, measure, prevRhythm) {
        switch (beat % 4) {
            case 0:
                return [
                    { value: { duration: duration, }, probability: 0.1 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.9 },
                ];
            case 0.5:
                return [
                    { value: { duration: 0.5, isRest: true }, probability: 1 },
                ];
            case 1:
                return [
                    { value: { duration: duration }, probability: 0.5 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.5 },
                ];
            case 1.5:
                return [
                    { value: { duration: duration }, probability: 0.4 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.6 },
                ];
            case 2:
                return [
                    { value: { duration: duration }, probability: 0.3 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.7 },
                ];
            case 2.5:
                return [
                    { value: { duration: duration }, probability: 0.1 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.9 },
                ];
            case 3:
                return [
                    { value: { duration: duration }, probability: 0.5 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.5 },
                ];
            case 3.5:
                return [
                    { value: { duration: duration }, probability: 0.05 },
                    { value: { duration: 0.5, isRest: true }, probability: 0.95 },
                ];
            default:
                return [
                    { value: { duration: 1, isRest: true }, probability: 1 },
                ];
       }
    }
}

var backgroundRhythmRules = [
    null,
    getBackgroundRule(1),
    getBackgroundRule(2),
    getBackgroundRule(3),
    getBackgroundRule(4),
    getBackgroundRule(5),
];

// Pitch rules (0=A, 1=B, 2=C)
var introPitchRule = function (prevNote, currentBeat, chord) {
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
                    stateMap = [0.5, 0, 0.3, 0, 0.2, 0, 0, 0];
                    break;
                default:
                    stateMap = [0.3, 0.3, 0.2, 0.2, 0.0, 0.0, 0.0, 0.0];
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
                    stateMap = [0.0, 0, 0, 0, 0.6, 0, 0, 0.4];
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
                    stateMap = [0, 0, 0, 0, 0.4, 0, 0, 0.6];
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
                    stateMap = [0.0, 0, 0.0, 0, 0.4, 0, 0, 0.6];
                    break;
                default:
                    stateMap = [0.0, 0.0, 0.0, 0.0, 0.3, 0.0, 0.4, 0.3];
                    break;
            }
            break;
    }
    // Translate the stateMap to actual notes based on the current chord
    for (var i = 0; i < chord; ++i)
        stateMap.unshift(0);
    return stateMap;
}
var melodyPitchRule = function (prevNote, currentBeat, chord) {
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