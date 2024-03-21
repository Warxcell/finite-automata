<script lang="ts" setup>
import {computed, ref, unref, watch} from "vue";
import {DeterministicFiniteAutomata, type FiniteAutomata, NonDeterministicFiniteAutomata} from "@/finiteAutomata";
import Graph from "@/components/Graph.vue";
import States from "@/components/States.vue";
import Alphabet from "@/components/Alphabet.vue";
import type {WatchStopHandle} from "@vue/runtime-core";
import DeterministicFiniteAutomataTransitionTable from "@/components/DeterministicFiniteAutomataTransitionTable.vue";
import NonDeterministicFiniteAutomataTransitionTable
  from "@/components/NonDeterministicFiniteAutomataTransitionTable.vue";
import {useItems} from "@/composables/useItems";


enum FiniteAutomataType {
  DETERMINISTIC,
  NON_DETERMINISTIC
}

const type = ref(FiniteAutomataType.DETERMINISTIC);

watch(type, () => {
  dfaTransitions.value = {};
  ndfaTransitions.value = []
})

const states = ref<string[]>(['q0', 'q1', 'q2', 'q3']);
const alphabet = ref<string[]>(['0', '1']);

watch(() => states.value, (newStates) => {
  const mappingValue = unref(dfaTransitions);
  Object.entries(mappingValue).forEach((item) => {
    Object.entries(item[1]).forEach((item2) => {
      if (!newStates.includes(item[0]) || !newStates.includes(item2[1])) {
        delete mappingValue[item[0]][item2[0]];
      }
    })
  })

  dfaTransitions.value = mappingValue;

  finalStates.value = finalStates.value.filter((item) => newStates.includes(item));

  if (initialState.value && !newStates.includes(initialState.value)) {
    initialState.value = undefined;
  }

  ndfaTransitions.value = ndfaTransitions.value.filter((item) => newStates.includes(item[0]) || newStates.includes(item[2]))
}, {
  deep: true
})

watch(alphabet, (newAlphabet) => {
  const mappingValue = unref(dfaTransitions);

  Object.entries(mappingValue).forEach((item) => {
    Object.entries(item[1]).forEach((item2) => {
      if (!newAlphabet.includes(item2[0])) {
        delete mappingValue[item[0]][item2[0]];
      }
    })
  })

  dfaTransitions.value = mappingValue

  ndfaTransitions.value = ndfaTransitions.value.filter((item) => newAlphabet.includes(item[1]))
}, {
  deep: true
})

const initialState = ref<string | undefined>('q0');

const dfaTransitions = ref<Record<string, Record<string, string>>>({
  'q0': {'0': 'q0', '1': 'q1'},
  'q1': {'0': 'q2', '1': 'q1'},
  'q2': {'0': 'q0', '1': 'q3'},
  'q3': {'0': 'q3', '1': 'q3'},
});

const ndfaTransitions = ref<[string, string, string][]>([
  ['q0', '0', 'q0'],
  ['q0', '1', 'q1'],
  ['q1', '0', 'q2'],
  ['q1', '1', 'q1'],
  ['q2', '0', 'q0'],
  ['q2', '1', 'q3'],
  ['q3', '0', 'q3'],
  ['q3', '1', 'q3'],
]);

const finalStates = ref(['q3']);


const fa = computed((): FiniteAutomata<any, any, any, any, any> | { error: string } => {
  if (!initialState.value) {
    return {
      error: 'Липсва начално състояние'
    };
  }

  switch (type.value) {
    case  FiniteAutomataType.DETERMINISTIC:
      return new DeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, dfaTransitions.value, finalStates.value
      );
    case FiniteAutomataType.NON_DETERMINISTIC:
      return new NonDeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, ndfaTransitions.value, finalStates.value
      );
    default:
      return {
        error: 'Не поддържан'
      }
  }
})

const words = ref<string[]>([])

const {newValue: newWord, add: addWord, remove: removeWord} = useItems(words);

const wordStatuses = computed(() => {
  const dfaUnref = unref(fa);
  if ('error' in dfaUnref) {
    return undefined;
  }
  return words.value.map((word) => dfaUnref.recognizes(word));
})


const charIndex = ref<number>(0)

const replayIndex = ref<number | null>(null)

let wordWatcher: WatchStopHandle | null = null;
const replay = (index: number | null) => {
  replayIndex.value = index
  charIndex.value = 0;

  if (wordWatcher) {
    wordWatcher();
  }

  if (index !== null) {
    wordWatcher = watch(() => words.value[index], () => {
      replayIndex.value = index
      charIndex.value = 0;
    });
  }
}

const highlightStates = computed(() => {
  if (replayIndex.value === null || typeof wordStatuses.value?.[replayIndex.value] === 'undefined') {
    return null;
  }

  const step = wordStatuses.value[replayIndex.value].steps[charIndex.value];

  const r = {
    [step.sourceState]: 'red',
  }
  if (step.targetState) {
    r[step.targetState] = 'green'
  }

  return r
})

const highlightTransitions = computed(() => {
  if (replayIndex.value === null || typeof wordStatuses.value?.[replayIndex.value] === 'undefined') {
    return null;
  }

  const steps = wordStatuses.value[replayIndex.value].steps;
  const status = steps[charIndex.value];
  if (status.targetState) {
    return [[status.sourceState, status.char, status.targetState, 'red']]
  } else {
    return null;
  }
})


const prevStep = () => {
  charIndex.value--;
}
const nextStep = () => {
  charIndex.value++;
}
</script>

<template>
  <div class="states">
    Състояния:

    <States v-model:final-states="finalStates" v-model:initial-state="initialState" v-model:states="states"/>
  </div>

  <div class="alphabet">
    Азбука:
    <Alphabet v-model="alphabet"/>
  </div>


  <div>
    Функция на състоянията

    <label>
      Определен
      <input v-model="type" :value="FiniteAutomataType.DETERMINISTIC" type="radio"/>
    </label>
    <label>
      Неопределен
      <input v-model="type" :value="FiniteAutomataType.NON_DETERMINISTIC" type="radio"/>
    </label>

    <div v-if="type === FiniteAutomataType.DETERMINISTIC">
      <DeterministicFiniteAutomataTransitionTable v-model="dfaTransitions" :alphabet :states/>
    </div>
    <div v-else>
      <NonDeterministicFiniteAutomataTransitionTable v-model="ndfaTransitions" :alphabet :states/>
    </div>
  </div>

  <div v-if="'error' in fa" class="dfa-error">
    Грешка при конструкцията на автомата: {{ fa.error }}
  </div>
  <div v-else>
    Напълно определен ли е автомата? {{ fa.isComplete() ? "ДА" : "НЕ" }}

    <Graph :alphabet="fa.alphabet" :finalStates="fa.finalStates" :highlightStates :highlightTransitions
           :initialState="fa.initialState" :states="fa.states" :transitions="fa.transitions"/>

    <template v-if="fa instanceof NonDeterministicFiniteAutomata">
      ОПРЕДЕЛЕН АВТОМАТ

      <Graph :alphabet="fa.deterministicFiniteAutomata.alphabet"
             :finalStates="fa.deterministicFiniteAutomata.finalStates"
             :highlightStates :highlightTransitions
             :initialState="fa.deterministicFiniteAutomata.initialState" :states="fa.deterministicFiniteAutomata.states"
             :transitions="fa.deterministicFiniteAutomata.transitions"/>
    </template>
  </div>

  <div v-if="replayIndex !== null" class="replay">
    <button :disabled="charIndex === 0" @click="prevStep">Предна стъпка</button>

    <span v-for="(char, i) in words[replayIndex]" :class="{current: charIndex === i}">{{ char }}</span>

    <button :disabled="wordStatuses?.[replayIndex].steps[charIndex+1] === undefined" @click="nextStep">Следваща
      стъпка
    </button>
  </div>


  <div class="words">
    Words:
    <div v-for="(word, i) in words">
      <input v-model="words[i]" type="text"/>

      <button @click="() => removeWord(word)">
        X
      </button>

      <span v-if="wordStatuses" :class="{ok: wordStatuses[i].recognized}" class="status">
        {{ wordStatuses[i].recognized ? "ДА" : "НЕ" }}

        <button v-if="replayIndex !== i"
                @click="replay(i)">Пусни</button>
        <button v-else @click="replay(null)">Спри</button>
      </span>
      <span v-else>
        Грешка
      </span>
    </div>


    <input v-model="newWord" type="text" @change="addWord"/>
  </div>

</template>

<style lang="scss" scoped>
.replay {
  .current {
    background-color: green;
  }
}

.dfa-error {
  background-color: red;
}

.states {
  .legend {
    .state {
      background-color: red;

      &.final {
        background-color: green;
      }
    }
  }

  .state {
    label {
      background-color: red;

      &.final {
        background-color: green;
      }
    }
  }
}

.words {

  .status {
    background-color: red;

    &.ok {
      background-color: green;
    }
  }
}
</style>