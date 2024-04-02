<script lang="ts" setup>

import {useItems} from "@/composables/useItems";
import ClosableError from "@/components/ClosableError.vue";

const alphabet = defineModel<string[]>({required: true})

const {add, remove, newValue, error} = useItems(alphabet);
</script>

<template>
  <table class="table table-xs">
    <tbody>
      <tr v-for="char in alphabet">
        <td>{{ char }}</td>
        <td class="text-right">
          <button class="btn btn-sm btn-square btn-error" @click="() => remove(char)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <div>
    <input placeholder="въведи буква" v-model="newValue" class="input input-bordered input-sm input-info w-full max-w-xs"
           maxlength="1"
           type="text"
           @change="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
</template>

<style lang="scss" scoped>

</style>
