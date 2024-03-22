<script lang="ts" setup>

import {useItems} from "@/composables/useItems";
import ClosableError from "@/components/ClosableError.vue";

const alphabet = defineModel<string[]>({required: true})

const {add, remove, newValue, error} = useItems(alphabet);
</script>

<template>
  <table class="table table-xs">
    <tr v-for="char in alphabet">
      <td>{{ char }}</td>
      <td>
        <button class="btn btn-sm btn-error" @click="() => remove(char)">x</button>
      </td>
    </tr>
  </table>
  <div>
    <input v-model="newValue" class="input input-bordered input-sm w-full max-w-xs"
           maxlength="1"
           type="text"
           @change="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
</template>

<style lang="scss" scoped>

</style>
