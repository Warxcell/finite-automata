<script lang="ts" setup>

import {useItems} from "@/composables/useItems";
import ClosableError from "@/components/ClosableError.vue";

const alphabet = defineModel<string[]>({required: true})

const {add, remove, newValue, error} = useItems(alphabet);
</script>

<template>
  <table>
    <tr v-for="char in alphabet">
      <td>{{ char }}</td>
      <td>
        <button class="btn" @click="() => remove(char)">x</button>
      </td>
    </tr>
  </table>
  <div>
    <input v-model="newValue" maxlength="1" type="text" @change="add">

    <ClosableError v-if="error" :error="error" @close="error = ''"/>
  </div>
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

    &:first-child {
      text-align: left;
    }

    &:nth-child(2) {
      text-align: right;
    }
  }

  .btn {
    background: transparent;
    color: #4d99ff;
    padding: 2px 10px;
  }
}
</style>
