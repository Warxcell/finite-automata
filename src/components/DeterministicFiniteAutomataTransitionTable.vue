<script lang="ts" setup>
import {ref, unref} from "vue";
import DeleteButton from "@/components/DeleteButton.vue";

defineProps<{
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
    <template v-for="(state) in states">
      <template v-for="(char) in alphabet">
        <tr class="hover">
          <td>{{ state }}</td>
          <td>{{ char }}</td>
          <td>
              <span v-if="mapping[state]?.[char]">
              {{ mapping[state]?.[char] }}
              </span>

            <select v-else v-model="newMappingTargetState" class="select select-info select-sm w-full max-w-xs"
                    @change="() => addNewMapping(state, char)">
              <option></option>
              <option v-for="state in states">
                {{ state }}
              </option>
            </select>
          </td>
          <td>
            <DeleteButton v-if="mapping[state]?.[char]"
                          @click="() => removeMapping(state, char)"
            />
          </td>
        </tr>
      </template>
    </template>
    </tbody>
  </table>
</template>