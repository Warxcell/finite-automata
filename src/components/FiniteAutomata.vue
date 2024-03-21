<script lang="ts" setup>
import {computed, ref, unref, watch} from "vue";
import {
  DeterministicFiniteAutomata,
  type FiniteAutomata,
  FiniteAutomataType,
  NonDeterministicFiniteAutomata
} from "@/finiteAutomata";
import Graph from "@/components/Graph.vue";
import States from "@/components/States.vue";
import Alphabet from "@/components/Alphabet.vue";
import type {WatchStopHandle} from "@vue/runtime-core";
import DeterministicFiniteAutomataTransitionTable from "@/components/DeterministicFiniteAutomataTransitionTable.vue";
import NonDeterministicFiniteAutomataTransitionTable
  from "@/components/NonDeterministicFiniteAutomataTransitionTable.vue";
import {useItems} from "@/composables/useItems";
import {assertNever} from "@/helper";

const states = defineModel<string[]>('states', {required: true});
const alphabet = defineModel<string[]>('alphabet', {required: true});
const initialState = defineModel<string | undefined>('initialState', {required: true});
const finalStates = defineModel<string[]>('finalStates', {required: true});
const transitions = defineModel<[string, string, string][]>('transitions', {required: true});
const type = defineModel<FiniteAutomataType>('type', {required: true});
const words = defineModel<string[]>('words', {required: true});

const dfaTransitions = computed<Record<string, Record<string, string>>>({
  get: () => {
    const dfaTransitions: Record<string, Record<string, string>> = {};

    transitions.value.forEach((transition) => {
      dfaTransitions[transition[0]] = {...(dfaTransitions[transition[0]] ?? {}), [transition[1]]: transition[2]}
    })

    return dfaTransitions;
  },
  set: (newValue) => {
    const newTransitions: [string, string, string][] = []

    Object.entries(newValue.value).forEach((item) => {
      Object.entries(item[1]).forEach((item2) => {
        newTransitions.push([item[0], item2[0], item2[1]]);
      })
    })
    transitions.value = newTransitions;
  }
})


watch(type, () => {
  transitions.value = []
})

watch(() => states.value, (newStates) => {
  finalStates.value = finalStates.value.filter((item) => newStates.includes(item));

  if (initialState.value && !newStates.includes(initialState.value)) {
    initialState.value = undefined;
  }

  transitions.value = transitions.value.filter((item) => newStates.includes(item[0]) || newStates.includes(item[2]))
}, {
  deep: true
})

watch(alphabet, (newAlphabet) => {
  transitions.value = transitions.value.filter((item) => newAlphabet.includes(item[1]))
}, {
  deep: true
})

const fa = computed((): FiniteAutomata<any, any, any, any, any> | { error: string } => {
  if (!initialState.value) {
    return {
      error: 'Липсва начално състояние'
    };
  }

  const t = unref(type);
  switch (t) {
    case  FiniteAutomataType.DETERMINISTIC:
      return new DeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, dfaTransitions.value, finalStates.value
      );
    case FiniteAutomataType.NON_DETERMINISTIC:
      return new NonDeterministicFiniteAutomata(
          states.value, alphabet.value, initialState.value, transitions.value, finalStates.value
      );
    default:
      return assertNever(t, {
        error: 'Не поддържан'
      })
  }
})

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

const transitionsBreadcrumbs = computed((): { label: string, highlight: boolean }[] => {
  const statuses = unref(wordStatuses)
  const replayIndexValue = unref(replayIndex)
  if (replayIndexValue === null || !statuses || statuses?.[replayIndexValue].steps.length === 0) {
    return [];
  }

  const steps = statuses[replayIndexValue].steps

  const breadcrumbs = [];
  breadcrumbs.push({label: steps[0].sourceState, highlight: charIndex.value === 0});

  for (let i = 0; i < steps.length; i++) {
    const item = steps[i]
    breadcrumbs.push(({label: item.char, highlight: i === charIndex.value}))

    const highlight = i === charIndex.value || i + 1 === charIndex.value;
    if (item.targetState) {
      breadcrumbs.push({label: item.targetState, highlight})
    } else {
      breadcrumbs.push({label: 'Липсва преход', highlight})
    }
  }

  return breadcrumbs;
})

const highlightStates = computed((): Record<string, string> | undefined => {
  if (replayIndex.value === null || typeof wordStatuses.value?.[replayIndex.value] === 'undefined') {
    return undefined;
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

const highlightTransitions = computed((): [string, string, string, string][] | undefined => {
  if (replayIndex.value === null || typeof wordStatuses.value?.[replayIndex.value] === 'undefined') {
    return undefined;
  }

  const steps = wordStatuses.value[replayIndex.value].steps;
  const status = steps[charIndex.value];
  if (status.targetState) {
    return [[status.sourceState, status.char, status.targetState, 'red']]
  } else {
    return undefined;
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
  <div class="states setting-item">
    <h2>Състояния</h2>

    <States v-model:final-states="finalStates" v-model:initial-state="initialState" v-model:states="states"/>
  </div>

  <div class="alphabet setting-item">
    <h2>Азбука</h2>
    <Alphabet v-model="alphabet"/>
  </div>


  <div class="setting-item">
    <h2>Функция на състоянията</h2>
    <div>
      <label>
        <input v-model="type" :value="FiniteAutomataType.DETERMINISTIC" type="radio"/>
        Детерминиран
      </label>
      <label>
        <input v-model="type" :value="FiniteAutomataType.NON_DETERMINISTIC" type="radio"/>
        Недетерминиран
      </label>
    </div>

    <div v-if="type === FiniteAutomataType.DETERMINISTIC">
      <DeterministicFiniteAutomataTransitionTable v-model="dfaTransitions" :alphabet :states/>
    </div>
    <div v-else>
      <NonDeterministicFiniteAutomataTransitionTable v-model="transitions" :alphabet :states/>
    </div>
  </div>

  <div class="result-holder">
    <div class="setting-item">
      <div v-if="'error' in fa" class="dfa-error">
        <h2>Грешка при конструкцията на автомата: {{ fa.error }}</h2>
      </div>
      <div v-else>
        <h2 class="is-diterm">Aвтомата <strong>{{ fa.isComplete() ? "Е" : "НЕ Е" }}</strong> напълно определен!</h2>

        <Graph :alphabet="fa.alphabet"
               :finalStates="fa.finalStates"
               :highlightStates
               :highlightTransitions
               :initialState="fa.initialState"
               :states="fa.states"
               :transitions="fa.transitions"/>

        <template v-if="fa instanceof NonDeterministicFiniteAutomata">
          ДЕТЕРМИНИРАН АВТОМАТ

          <Graph :alphabet="fa.deterministicFiniteAutomata.alphabet"
                 :finalStates="fa.deterministicFiniteAutomata.finalStates"
                 :highlightStates
                 :highlightTransitions
                 :initialState="fa.deterministicFiniteAutomata.initialState"
                 :states="fa.deterministicFiniteAutomata.states"
                 :transitions="fa.deterministicFiniteAutomata.transitions"/>
        </template>
      </div>
    </div>

    <div class="setting-item">
      <h2>Проверка на дума</h2>

      <div v-if="replayIndex !== null" class="replay">
        <button :disabled="charIndex === 0" class="btn" @click="prevStep">Предна стъпка</button>

        <span v-for="(char, i) in words[replayIndex]" :class="{current: charIndex === i}">{{ char }}</span>

        <button :disabled="wordStatuses?.[replayIndex].steps[charIndex+1] === undefined" class="btn"
                @click="nextStep">Следваща
          стъпка
        </button>

        <div class="transitions-breadcrumbs">
            <span v-for="(item) in transitionsBreadcrumbs">
              <span :class="{highlight: item.highlight}">{{ item.label }}</span>
            </span>
        </div>
      </div>
      <div class="words">
        <table>
          <tr v-for="(word, i) in words">
            <td><input v-model="words[i]" type="text"/></td>
            <td>
              <button class="btn" @click="() => removeWord(word)"> X</button>
            </td>
            <td>
              <span v-if="wordStatuses" :class="{ok: wordStatuses[i].recognized}" class="status">
                  {{ wordStatuses[i].recognized ? "ДА" : "НЕ" }}
                <button v-if="replayIndex !== i" class="btn" @click="replay(i)">Проследи</button>
                <button v-else class="btn" @click="replay(null)">Спри</button>
              </span>
            </td>
          </tr>
        </table>


        <input v-model="newWord" type="text" @change="addWord"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.transitions-breadcrumbs {
  span {
    margin-right: 10px;

    &.highlight {
      background-color: red;
    }
  }
}


.dfa-error {
  color: red;
}

strong {
  font-weight: bold;
}

.btn {
  background: #4d99ff;
  border: solid 1px #4d99ff;
  border-radius: 3px;
  padding: 5px 16px;
  cursor: pointer;
  color: #fff;
}

table {
  border-spacing: 0;
  width: 100%;

  th {
    font-weight: bold;
    padding: 5px;
    background-color: #488cd0;
    color: #fff;
    font-size: 12px;
    text-transform: uppercase;
  }

  td {
    border-bottom: solid 1px #aaa;
    padding: 5px;
    text-align: center;
  }

  .btn {
    background: transparent;
    color: #4d99ff;
    padding: 2px 10px;
  }
}

.setting-item {
  border: solid 1px #333;
  padding: 10px;
  border-radius: 17px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: auto;
}

.result-holder {
  flex: 0 0 100%;
  display: flex;
  gap: 10px;

  .is-diterm {
    text-align: center;
  }
}

.replay {
  .current {
    background-color: green;
  }
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
    color: red;

    &.ok {
      color: green;
    }
  }
}
</style>