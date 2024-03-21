<script lang="ts" setup>

import {useItems} from "@/composables/useItems";

const states = defineModel<string[]>('states', {required: true})
const initialState = defineModel<string | undefined>('initialState', {required: true})
const finalStates = defineModel<string[]>('finalStates', {required: true})

const {add, remove, newValue} = useItems(states);


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
        <button @click="() => remove(state)">x</button>
      </td>
    </tr>
    </tbody>
  </table>

  <span>
        <input v-model="newValue" type="text" @change="add">
    </span>
</template>

<style lang="scss" scoped>

</style>