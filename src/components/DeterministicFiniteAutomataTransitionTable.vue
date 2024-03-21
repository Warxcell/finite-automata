<script lang="ts" setup>
import {ref, unref} from "vue";

const props = defineProps<{
  states: string[]
  alphabet: string[]
}>()

const mapping = defineModel<Record<string, Partial<Record<string, string>>>>({required: true})

const newMappingTargetState = ref('')
const addNewMapping = (sourceState: string, char: string) => {
  const newMapTargetState = unref(newMappingTargetState);
  const oldMap = unref(mapping)

  oldMap[sourceState] = {...(oldMap[sourceState] ?? {}), [char]: newMapTargetState}

  mapping.value = oldMap

  newMappingTargetState.value = ''
}

const removeMapping = (sourceState: string, char: string) => {
  const oldMap = unref(mapping);
  delete oldMap[sourceState]?.[char]

  mapping.value = oldMap
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
    <template v-for="(state) in states">
      <template v-for="(char) in alphabet">
        <tr>
          <td>{{ state }}</td>
          <td>{{ char }}</td>
          <td>
              <span v-if="mapping[state]?.[char]">
              {{ mapping[state]?.[char] }}
              </span>

            <select v-else v-model="newMappingTargetState" @change="() => addNewMapping(state, char)">
              <option></option>
              <option v-for="state in states">
                {{ state }}
              </option>
            </select>
          </td>
          <td>
            <button v-if="mapping[state]?.[char]" class="btn" @click="() => removeMapping(state, char)">X</button>
          </td>
        </tr>
      </template>
    </template>
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
