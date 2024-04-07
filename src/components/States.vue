<script lang="ts" setup>

import {useItems} from "@/composables/useItems";
import ClosableError from "@/components/ClosableError.vue";

const states = defineModel<string[]>('states', {required: true})
const initialState = defineModel<string | undefined>('initialState', {required: true})
const finalStates = defineModel<string[]>('finalStates', {required: true})

const {add, remove, newValue, error} = useItems(states);


const toggleState = (state: string) => {
  if (finalStates.value.includes(state)) {
    finalStates.value.splice(finalStates.value.indexOf(state), 1);
  } else {
    finalStates.value.push(state)
  }
}
const invert = () => {
  states.value.forEach((item) => {
    toggleState(item)
  })
}
</script>

<template>
  <button class="btn btn-sm btn-info" @click="invert">Инверсия</button>

  <table class="table">
    <thead>
    <tr>
      <th>Начално?</th>
      <th>Финално?</th>
      <th>Име</th>
      <th>Изтрий</th>
    </tr>
    </thead>
    <tbody>

    <tr v-for="state in states" class="hover">
      <td><input v-model="initialState" :value="state" class="radio radio-info" type="radio"/></td>
      <td><input :id="`${state}-checkbox`" v-model="finalStates" :value="state" class="checkbox checkbox-info"
                 type="checkbox"/></td>
      <td :class="{final: finalStates.includes(state)}">
        {{ state }}
      </td>
      <td>
        <button class="btn btn-sm btn-square btn-error" @click="() => remove(state)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>
    </tbody>
  </table>

  <div>
    <input placeholder="ново състояние" v-model="newValue" class="input input-bordered input-sm input-info w-full max-w-xs" type="text" @change="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
</template>

<style lang="scss" scoped>
</style>
