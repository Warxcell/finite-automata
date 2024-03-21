<script lang="ts" setup>
import {ref} from "vue";

const props = defineProps<{
  states: string[]
  alphabet: string[]
}>()

const mapping = defineModel<[string, string, string][]>({required: true})

const newSourceState = ref('')
const newChar = ref('')
const newTargetState = ref('')

const addNewMapping = () => {
  if (!newSourceState.value || !newChar.value || !newTargetState.value) {
    return
  }

  mapping.value.push([newSourceState.value, newChar.value, newTargetState.value])

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
        <button @click="() => removeMapping(i)">X</button>
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

    </tbody>
  </table>
</template>

<style lang="scss" scoped>

</style>