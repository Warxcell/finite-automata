<script lang="ts" setup>
import {computed, ref, unref, watch} from "vue";
import {DeterministicFiniteAutomata, type FiniteAutomata, NonDeterministicFiniteAutomata} from "@/finiteAutomata";
import Graph from "@/components/Graph.vue";
import type {WatchStopHandle} from "@vue/runtime-core";
import DeterministicFiniteAutomataTransitionTable from "@/components/DeterministicFiniteAutomataTransitionTable.vue";
import NonDeterministicFiniteAutomataTransitionTable
  from "@/components/NonDeterministicFiniteAutomataTransitionTable.vue";


enum FiniteAutomataType {
  DETERMINISTIC,
  NON_DETERMINISTIC
}

const type = ref(FiniteAutomataType.DETERMINISTIC);

watch(type, () => {
  mapping.value = {};
  ndfaMapping.value = []
})

const useDefinition = (removeCallback?: (state: string) => void) => {
  const values = ref<string[]>([])
  const newValue = ref<string>('')

  const add = () => {
    values.value.push(newValue.value)

    newValue.value = ''
  }

  const remove = (value: string) => {
    values.value.splice(values.value.indexOf(value), 1)

    if (removeCallback) {
      removeCallback(value)
    }
  }

  return {
    values,
    newValue,
    add,
    remove
  }
}


const {values: states, newValue: newState, add: addState, remove: removeState} = useDefinition((state) => {
  const mappingValue = unref(mapping);
  delete mappingValue[state];

  Object.entries(mappingValue).forEach((item) => {
    Object.entries(item[1]).forEach((item2) => {
      if (item2[1] === state) {
        delete mappingValue[item[0]][item2[0]];
      }
    })
  })

  const indexOf = finalStates.value.indexOf(state);

  if (indexOf !== -1) {
    finalStates.value.splice(indexOf, 1)
  }

  if (initialState.value === state) {
    initialState.value = undefined;
  }

  mapping.value = mappingValue


  ndfaMapping.value = ndfaMapping.value.filter((item) => item[0] === state || item[1] === state)
});

const {values: alphabet, newValue: newChar, add: addChar, remove: removeChar} = useDefinition((char) => {
  const mappingValue = unref(mapping);

  Object.entries(mappingValue).forEach((item) => {
    Object.entries(item[1]).forEach((item2) => {
      if (item2[0] === char) {
        delete mappingValue[item[0]][item2[0]];
      }
    })
  })

  mapping.value = mappingValue

  ndfaMapping.value = ndfaMapping.value.filter((item) => item[1] === char)
});


states.value = ['q0', 'q1', 'q2', 'q3'];
alphabet.value = ['0', '1']

const initialState = ref<string | undefined>('q0');

const mapping = ref<Record<string, Partial<Record<string, string>>>>({
  'q0': {'0': 'q0', '1': 'q1'},
  'q1': {'0': 'q2', '1': 'q1'},
  'q2': {'0': 'q0', '1': 'q3'},
  'q3': {'0': 'q3', '1': 'q3'},
});

const ndfaMapping = ref<[string, string, string][]>([
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

const invert = () => {
  states.value.forEach((item) => {
    toggleState(item)
  })
}

const toggleState = (state: string) => {
  if (finalStates.value.includes(state)) {
    finalStates.value.splice(finalStates.value.indexOf(state), 1);
  } else {
    finalStates.value.push(state)
  }
}

const fa = computed((): FiniteAutomata | { error: string } => {
  if (!initialState.value) {
    return {
      error: 'Липсва начално състояние'
    };
  }

  switch (type.value) {
    case  FiniteAutomataType.DETERMINISTIC:
      return new DeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, mapping.value, finalStates.value
      );
    case FiniteAutomataType.NON_DETERMINISTIC:
      return new NonDeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, ndfaMapping.value, finalStates.value
      );
    default:
      return {
        error: 'Не поддържан'
      }
  }
})


const {values: words, newValue: newWord, add: addWord, remove: removeWord} = useDefinition();

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

    <button @click="invert">Инверсия</button>

    <table>
      <thead>
      <tr>
        <th>Начално?</th>
        <th>Финално?</th>
        <th>Име</th>
        <th>Изтрий</th>
      </tr>
      </thead>
      <tbody>

      <tr v-for="state in states" class="state">
        <td><input v-model="initialState" :value="state" type="radio"/></td>
        <td><input :id="`${state}-checkbox`" v-model="finalStates" :value="state" type="checkbox"/></td>
        <td :class="{final: finalStates.includes(state)}">
          {{ state }}
        </td>
        <td>
          <button @click="() => removeState(state)">x</button>
        </td>
      </tr>
      </tbody>
    </table>

    <span>
        <input v-model="newState" type="text" @change="addState">
    </span>
  </div>

  <div class="alphabet">
    Азбука:
    <div v-for="char in alphabet">
      <button>
        {{ char }}
      </button>
      <button @click="() => removeChar(char)">x</button>
    </div>
    <span>
        <input v-model="newChar" type="text" @change="addChar">
    </span>
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
      <DeterministicFiniteAutomataTransitionTable v-model="mapping" :alphabet :states/>
    </div>
    <div v-else>
      <NonDeterministicFiniteAutomataTransitionTable v-model="ndfaMapping" :alphabet :states/>
    </div>
  </div>

  <div v-if="'error' in fa" class="dfa-error">
    Грешка при конструкцията на автомата: {{ fa.error }}
  </div>
  <div v-else>
    Напълно определен ли е автомата? {{ fa.isComplete() ? "ДА" : "НЕ" }}

    <Graph :alphabet="fa.alphabet" :finalStates="fa.finalStates" :highlightStates :highlightTransitions
           :initialState="fa.initialState" :states="fa.states" :transitions="fa.transitions"/>

    <Graph v-if="fa instanceof NonDeterministicFiniteAutomata" :alphabet="fa.deterministicFiniteAutomata.alphabet"
           :finalStates="fa.deterministicFiniteAutomata.finalStates"
           :highlightStates :highlightTransitions
           :initialState="fa.deterministicFiniteAutomata.initialState" :states="fa.deterministicFiniteAutomata.states"
           :transitions="fa.deterministicFiniteAutomata.transitions"/>

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

<style lang="scss">
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