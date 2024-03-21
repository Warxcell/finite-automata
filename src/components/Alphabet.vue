<script lang="ts" setup>

import {useItems} from "@/composables/useItems";

const alphabet = defineModel<string[]>({required: true})

const {add, remove, newValue} = useItems(alphabet);
</script>

<template>
  <div v-for="char in alphabet">
    <button>
      {{ char }}
    </button>
    <button @click="() => remove(char)">x</button>
  </div>
  <span>
      <input v-model="newValue" type="text" @change="add">
  </span>
</template>

<style lang="scss" scoped>

</style>