<template>
  <button class="btn"><slot></slot></button>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.btn {
  background: #4d99ff;
  border: solid 1px #4d99ff;
  border-radius: 3px;
  padding: 5px 16px;
  cursor: pointer;
  color: #fff;
}
</style>
