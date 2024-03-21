<script lang="ts" setup>
import {ref, unref} from "vue";

const props = defineProps<{
  states: string[]
  alphabet: string[]
}>()

const mapping = defineModel<Record<string, Partial<Record<string, string>>>>({required: true})


const newMappingTargetState = ref('')
const addNewMapping = (sourceState: string, char: string) => {
  const newMap = unref(newMappingTargetState);

  mapping.value[sourceState] = {...(mapping.value[sourceState] ?? {}), [char]: newMap}

  newMappingTargetState.value = ''
}

const removeMapping = (sourceState: string, char: string) => {
  const mappingValue = unref(mapping);
  delete mappingValue[sourceState]?.[char]

  mapping.value = mappingValue
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
            <button v-if="mapping[state]?.[char]" @click="() => removeMapping(state, char)">X</button>
          </td>
        </tr>
      </template>
    </template>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>

</style>