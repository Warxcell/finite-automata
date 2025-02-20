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
import DeterministicFiniteAutomataTransitionTable from "@/components/DeterministicFiniteAutomataTransitionTable.vue";
import NonDeterministicFiniteAutomataTransitionTable
  from "@/components/NonDeterministicFiniteAutomataTransitionTable.vue";
import {useItems} from "@/composables/useItems";
import {assertNever} from "@/helper";
import ClosableError from "@/components/ClosableError.vue";
import WordReplay from "@/components/WordReplay.vue";
import DeleteButton from "@/components/DeleteButton.vue";

defineProps<{
  name: string
}>()
const states = defineModel<string[]>('states', {required: true});
const alphabet = defineModel<string[]>('alphabet', {required: true});
const initialState = defineModel<string | undefined>('initialState', {required: true});
const finalStates = defineModel<string[]>('finalStates', {required: true});
const transitions = defineModel<[string, string, string][]>('transitions', {required: true});
const type = defineModel<FiniteAutomataType>('type', {required: true});
const words = defineModel<string[]>('words', {required: true});

const dfaTransitions = computed<Record<string, Record<string, string>>>({
  get: () => {
    const transformed: Record<string, Record<string, string>> = {};

    transitions.value.forEach((transition) => {
      transformed[transition[0]] = {...(transformed[transition[0]] ?? {}), [transition[1]]: transition[2]}
    })

    return transformed;
  },
  set: (newValue) => {
    const newTransitions: [string, string, string][] = []

    Object.entries(newValue).forEach((item) => {
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

const {newValue: newWord, add: addWord, remove: removeWord, error: wordError} = useItems(words);

const wordStatuses = computed(() => {
  const dfaUnref = unref(fa);
  if ('error' in dfaUnref) {
    return undefined;
  }
  return words.value.map((word) => dfaUnref.recognizes(word));
})

const stepIndex = ref<number>(0)

const replayIndex = ref<number | null>(null)

const replay = (index: number | null) => {
  replayIndex.value = index
  stepIndex.value = 0
}

const highlightStates = computed((): Record<string, string> | undefined => {
  if (replayIndex.value === null || typeof wordStatuses.value?.[replayIndex.value] === 'undefined') {
    return undefined;
  }

  const step = wordStatuses.value[replayIndex.value]?.steps[stepIndex.value];
  if (!step) {
    return undefined
  }

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

  const status = wordStatuses.value[replayIndex.value]?.steps[stepIndex.value];
  if (status?.targetState) {
    return [[status.sourceState, status.char, status.targetState, 'red']]
  } else {
    return undefined;
  }
})

const newMappingTargetState = ref('');
const addNewMapping = (sourceState: string, char: string) => {
  transitions.value.push([sourceState, char, newMappingTargetState.value]);

  newMappingTargetState.value = ''
}

</script>

<template>
  <div class="states setting-item">
    <h2 class="mx-auto text-2xl">Състояния</h2>

    <States v-model:final-states="finalStates" v-model:initial-state="initialState" v-model:states="states"/>
  </div>

  <div class="alphabet setting-item">
    <h2 class="mx-auto text-2xl">Азбука</h2>
    <Alphabet v-model="alphabet"/>
  </div>


  <div class="setting-item">
    <h2 class="mx-auto text-2xl">Функция на състоянията</h2>
    <div>
      <label class="label cursor-pointer">
        <span class="label-text">Детерминиран</span>
        <input v-model="type" :value="FiniteAutomataType.DETERMINISTIC" class="radio radio-info" type="radio"/>
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">Недетерминиран</span>
        <input v-model="type" :value="FiniteAutomataType.NON_DETERMINISTIC" class="radio radio-info" type="radio"/>
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
      <h2 class="mx-auto text-2xl">Проверка на дума</h2>

      <div v-if="replayIndex !== null && wordStatuses?.[replayIndex] && initialState" class="text-center">
        <WordReplay v-model:char-index="stepIndex"
                    :finalStates
                    :initialState
                    :status="wordStatuses[replayIndex]!"
                    :word="words[replayIndex]!"
        />
        <button class="btn btn-sm uppercase btn-error mt-3" @click="replay(null)">Спри</button>
      </div>

      <div v-else class="words">
        <table class="table table-xs table-auto">
          <thead>
          <tr>
            <th>Дума</th>
            <th>Разпознава ли се?</th>
            <th>
              <div class="tooltip" data-tip="Проследи с тази дума стъпка по стъпка">
                Проследи
              </div>
            </th>
            <th>Изтрий</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(word, i) in words" class="hover">
            <td><input v-model="words[i]" class="input input-bordered input-xs input-info w-full max-w-xs"
                       placeholder="въведи дума" type="text"/></td>
            <td>
                <span v-if="wordStatuses?.[i]" :class="{ok: wordStatuses[i]!.recognized}" class="status">
                    {{ wordStatuses[i]!.recognized ? "ДА" : "НЕ" }}
                </span>
            </td>
            <td>
              <button class="btn btn-info btn-sm btn-outline" @click="replay(i)">
                Проследи
              </button>
            </td>
            <td>
              <DeleteButton @click="() => removeWord(word)"/>
            </td>
          </tr>
          </tbody>
        </table>

        <input v-model="newWord" class="input input-bordered input-sm input-info w-full mt-4" placeholder="въведи дума"
               type="text" @change="addWord"/>

        <ClosableError v-if="wordError" :error="wordError" @close="wordError = ''"/>
      </div>
    </div>

    <div class="setting-item">
      <div v-if="'error' in fa" class="alert alert-error" role="alert">
        <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"/>
        </svg>
        <span>Грешка при конструкцията на краен автомат: {{ fa.error }}</span>
      </div>
      <div v-else class="flex flex-col gap-2 flex-wrap">
        <h2 class="mx-auto text-2xl">Автоматът <strong class="font-bold">{{
            fa.isComplete().isComplete ? "Е" : "НЕ Е"
          }}</strong> напълно
          определен!</h2>

        <table v-if="!fa.isComplete().isComplete" class="table table-xs">
          <thead>
          <tr>
            <th colspan="3">Липсващи преходи</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item) in fa.isComplete().missingTransitions">
            <td>
              {{ item.sourceState }}
            </td>
            <td>
              {{ item.char }}
            </td>
            <td>
              <select v-model="newMappingTargetState" class="select select-info select-sm w-full max-w-xs"
                      @change="() => addNewMapping(item.sourceState, item.char)">
                <option></option>
                <option v-for="state in states">
                  {{ state }}
                </option>
              </select>
            </td>
          </tr>
          </tbody>
        </table>

        <Graph
            v-show="fa instanceof DeterministicFiniteAutomata || replayIndex === null"
            :alphabet="fa.alphabet"
            :finalStates="fa.finalStates"
            :highlightStates
            :highlightTransitions
            :initialState="fa.initialState"
            :name
            :states="fa.states"
            :transitions="fa.transitions"/>

        <template v-if="fa instanceof NonDeterministicFiniteAutomata">
          ДЕТЕРМИНИРАН АВТОМАТ

          <Graph
              :alphabet="fa.deterministicFiniteAutomata.alphabet"
              :finalStates="fa.deterministicFiniteAutomata.finalStates"
              :highlightStates
              :highlightTransitions
              :initialState="fa.deterministicFiniteAutomata.initialState"
              :name
              :states="fa.deterministicFiniteAutomata.states"
              :transitions="fa.deterministicFiniteAutomata.transitions"/>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  flex-wrap: wrap;
  display: flex;
  gap: 10px;
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
