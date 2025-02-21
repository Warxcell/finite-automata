<script lang="ts" setup>

import {useItems} from "@/composables/useItems";
import ClosableError from "@/components/ClosableError.vue";
import DeleteButton from "@/components/DeleteButton.vue";

const alphabet = defineModel<string[]>({required: true})

const {add, remove, newValue, error} = useItems(alphabet);
</script>

<template>
  <table class="table table-xs">
    <tbody>
    <tr v-for="char in alphabet">
      <td>{{ char }}</td>
      <td class="text-right">
        <DeleteButton @click="() => remove(char)"/>
      </td>
    </tr>
    </tbody>
  </table>
  <div>
    <input placeholder="въведи буква" v-model="newValue"
           class="input input-bordered input-sm input-info w-full max-w-xs"
           maxlength="1"
           type="text"
           @change="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
</template>

<style lang="scss" scoped>

</style>
