export enum FiniteAutomataType {
    DETERMINISTIC,
    NON_DETERMINISTIC
}

export type RecognizesResult<State extends string> = {
    recognized: boolean
    steps: RecognizedResultStep<State>[]
}

export type RecognizedResultStep<State extends string> = {
    sourceState: State
    char: string // this is string, because somebody could give us non-alphabet char
    charIndex: number
    targetState: State | undefined
}

export type IsCompleteResult<State extends string, Alphabet extends string> = {
    isComplete: boolean,
    missingTransitions: { sourceState: State, char: Alphabet }[]
}

export interface FiniteAutomata<State extends string, Alphabet extends string, InitialState extends State, FinalState extends State, Transition> {

    readonly states: State[];

    readonly alphabet: Alphabet[]

    readonly initialState: InitialState

    readonly finalStates: FinalState[]

    readonly transitions: Transition

    isComplete(): IsCompleteResult<State, Alphabet>

    recognizes(word: string): RecognizesResult<any>
}

function includes<
    T extends string | number | bigint | boolean | null | undefined,
>(array: T[] | Readonly<T[]>, value: any): value is T {
    return array.includes(value)
}

export class DeterministicFiniteAutomata<State extends string, Alphabet extends string, InitialState extends State, FinalState extends State, Transition extends Partial<Record<State, Partial<Record<Alphabet, State>>>>> implements FiniteAutomata<State, Alphabet, InitialState, FinalState, Transition> {
    constructor(
        private readonly _states: State[],
        private readonly _alphabet: Alphabet[],
        private readonly _initialState: InitialState,
        private readonly _map: Transition,
        private readonly _finalStates: FinalState[]
    ) {
    }

    get alphabet(): Alphabet[] {
        return this._alphabet;
    }

    get initialState(): InitialState {
        return this._initialState;
    }

    get states(): State[] {
        return this._states;
    }

    get transitions(): Transition {
        return this._map;
    }

    get finalStates(): FinalState[] {
        return this._finalStates;
    }

    isComplete(): IsCompleteResult<State, Alphabet> {
        const missingTransitions: { sourceState: State, char: Alphabet }[] = [];

        for (let i = 0; i < this._states.length; i++) {
            for (let c = 0; c < this._alphabet.length; c++) {
                if (typeof this._map[this._states[i]!]?.[this._alphabet[c]!] === 'undefined') {
                    missingTransitions.push({sourceState: this._states[i]!, char: this._alphabet[c]!})
                }
            }
        }

        return {
            isComplete: missingTransitions.length === 0,
            missingTransitions
        }
    }

    recognizes(word: string): RecognizesResult<State> {
        let state: State = this._initialState;

        const steps: RecognizedResultStep<State>[] = [];

        for (let i = 0; i < word.length; i++) {
            const letter = word[i]!
            const nextState = this._map?.[state]?.[letter as Alphabet];

            steps.push({
                sourceState: state,
                char: letter,
                charIndex: i,
                targetState: nextState
            })

            if (!nextState) {
                return {
                    recognized: false,
                    steps
                }
            }
            state = nextState;
        }

        return {
            recognized: includes(this._finalStates, state),
            steps
        }
    }
}

export class NonDeterministicFiniteAutomata<State extends string, Alphabet extends string, InitialState extends State, FinalState extends State, Transition extends [State, Alphabet, State][]> implements FiniteAutomata<State, Alphabet, InitialState, FinalState, Transition> {
    private readonly dfa: DeterministicFiniteAutomata<any, any, any, any, any>;

    constructor(
        private readonly _states: State[],
        private readonly _alphabet: Alphabet[],
        private readonly _initialState: InitialState,
        private readonly _map: Transition,
        private readonly _finalStates: FinalState[]
    ) {
        const queue: State[][] = [[_initialState]];

        const newStates: string[] = [];
        const newFinalStates: string[] = [];
        const newMap: Record<string, Partial<Record<Alphabet, string>>> = {};

        let states: State[] | undefined = undefined
        while (states = queue.shift()) {
            const newName = states.join();

            newStates.push(newName);

            if (states.some((item) => includes(_finalStates, item))) {
                newFinalStates.push(newName);
            }


            for (let i = 0; i < _alphabet.length; i++) {
                const char = _alphabet[i]!;

                const newTargetStateArray: State[] = [];

                for (let j = 0; j < _map.length; j++) {
                    const map = _map[j]!;

                    if (states.includes(map[0]) && map[1] === char && !newTargetStateArray.includes(map[2])) {
                        newTargetStateArray.push(map[2]);
                    }
                }

                newTargetStateArray.sort()

                if (!newTargetStateArray.length) {
                    continue;
                }

                const newTargetStateName = newTargetStateArray.join()

                if (!newStates.includes(newTargetStateName)) {
                    queue.push(newTargetStateArray);
                }

                newMap[newName] = {...(newMap[newName] ?? {}), [char]: newTargetStateName}
            }
        }

        this.dfa = new DeterministicFiniteAutomata(newStates, _alphabet, _initialState, newMap, newFinalStates);
    }


    get states(): State[] {
        return this._states;
    }

    get alphabet(): Alphabet[] {
        return this._alphabet;
    }

    get initialState(): InitialState {
        return this._initialState;
    }

    get transitions(): Transition {
        return this._map;
    }

    get finalStates(): FinalState[] {
        return this._finalStates;
    }

    get deterministicFiniteAutomata() {
        return this.dfa;
    }

    isComplete(): IsCompleteResult<State, Alphabet> {
        const missingTransitions: { sourceState: State, char: Alphabet }[] = [];

        for (let i = 0; i < this._states.length; i++) {
            for (let c = 0; c < this._alphabet.length; c++) {
                if (!this._map.find((item) => item[0] === this._states[i] && item[1] === this._alphabet[c])) {
                    missingTransitions.push({sourceState: this._states[i]!, char: this._alphabet[c]!})
                }
            }
        }

        return {
            isComplete: missingTransitions.length === 0,
            missingTransitions
        }
    }

    recognizes(word: string): RecognizesResult<string> {
        return this.dfa.recognizes(word);
    }
}