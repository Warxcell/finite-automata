import {ref} from 'vue'
import {defineStore} from 'pinia'
import {FiniteAutomataType} from "@/finiteAutomata";


type FiniteAutomataStoreItem = {
    name: string,
    states: string[],
    alphabet: string[],
    initialState: string | undefined,
    finalStates: string[],
    type: FiniteAutomataType,
    transitions: [string, string, string][],
    words: string[]
}

const states = ['q0', 'q1', 'q2', 'q3'];
const alphabet = ['0', '1'];
const initialState = 'q0';
const finalStates = ['q3'];
const type = FiniteAutomataType.DETERMINISTIC;

const transitions: [string, string, string][] = [
    ['q0', '0', 'q0'],
    ['q0', '1', 'q1'],
    ['q1', '0', 'q2'],
    ['q1', '1', 'q1'],
    ['q2', '0', 'q0'],
    ['q2', '1', 'q3'],
    ['q3', '0', 'q3'],
    ['q3', '1', 'q3'],
]

const words = ['101']

const exampleItem = {
    name: 'Example',
    states,
    alphabet,
    initialState,
    finalStates,
    type,
    transitions,
    words
}

export const useFiniteAutomataStore = defineStore('finite_automata_store', () => {
    const items = ref<
        FiniteAutomataStoreItem[]>([{...exampleItem}])

    function add() {
        items.value.push({
            name: '',
            states: [],
            alphabet: [],
            initialState: undefined,
            finalStates: [],
            type: FiniteAutomataType.DETERMINISTIC,
            transitions: [],
            words: []
        })
    }

    function remove(index: number) {
        items.value.splice(index, 1);
    }

    return {items, add, remove}
}, {
    persist: true
})
