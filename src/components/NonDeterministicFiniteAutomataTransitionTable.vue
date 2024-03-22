<script lang="ts" setup>
import {ref} from "vue";
import ClosableError from "@/components/ClosableError.vue";

const props = defineProps<{
  states: string[]
  alphabet: string[]
}>()

const mapping = defineModel<[string, string, string][]>({required: true})

const newSourceState = ref('')
const newChar = ref('')
const newTargetState = ref('')

const error = ref('');

const addNewMapping = () => {
  error.value = ''

  if (!newSourceState.value || !newChar.value || !newTargetState.value) {
    return
  }

  const newItem: [string, string, string] = [newSourceState.value, newChar.value, newTargetState.value];
  if (mapping.value.find((item) => item[0] === newItem[0] && item[1] === newItem[1] && item[2] === newItem[2])) {
    error.value = 'Вече има такъв преход'
  } else {
    mapping.value.push(newItem)
  }

  newSourceState.value = ''
  newChar.value = ''
  newTargetState.value = ''
}

const removeMapping = (index: number) => {
  mapping.value.splice(index, 1)
}
</script>

<template>
  <table>
    <thead>
    <tr>
      <th>Състояние</th>
      <th>Преход</th>
      <th>Следващо състояние</th>
      <th>Изтрий</th>
    </tr>
    </thead>

    <tbody>
    <tr v-for="(state, i) in mapping">
      <td>{{ state[0] }}</td>
      <td>{{ state[1] }}</td>
      <td>{{ state[2] }}</td>
      <td>
        <button class="btn" @click="() => removeMapping(i)">X</button>
      </td>
    </tr>

    <tr>
      <td>
        <select v-model="newSourceState" @change="() => addNewMapping()">
          <option></option>
          <option v-for="state in states">
            {{ state }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="newChar" @change="() => addNewMapping()">
          <option></option>
          <option v-for="char in alphabet">
            {{ char }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="newTargetState" @change="() => addNewMapping()">
          <option></option>
          <option v-for="state in states">
            {{ state }}
          </option>
        </select>
      </td>
    </tr>

    <tr v-if="error">
      <td colspan="3">
        <ClosableError :error="error" @close="error = ''"/>
      </td>
    </tr>
    </tbody>
  </table>
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
