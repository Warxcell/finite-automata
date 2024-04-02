<script lang="ts" setup>
import {ref} from "vue";
import ClosableError from "@/components/ClosableError.vue";

defineProps<{
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
  <table class="table table-xs">
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
        <button class="btn btn-sm btn-square btn-error" @click="() => removeMapping(i)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>

    <tr>
      <td>
        <select v-model="newSourceState" class="select select-info select-sm w-full max-w-xs"
                @change="() => addNewMapping()">
          <option></option>
          <option v-for="state in states">
            {{ state }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="newChar" class="select select-info select-sm w-full max-w-xs"
                @change="() => addNewMapping()">
          <option></option>
          <option v-for="char in alphabet">
            {{ char }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="newTargetState" class="select select-info select-sm w-full max-w-xs"
                @change="() => addNewMapping()">
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

</style>
