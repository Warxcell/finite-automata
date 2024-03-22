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
  <button class="btn" @click="invert">Инверсия</button>

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
        <button class="btn" @click="() => remove(state)">x</button>
      </td>
    </tr>
    </tbody>
  </table>

  <div>
    <input v-model="newValue" type="text" @change="add" @focusout="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
</template>

<style lang="scss" scoped>
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
</style>
