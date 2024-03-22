<script lang="ts" setup>
import {ref, watch} from "vue";


const element = ref<HTMLDivElement | null>(null);
const title = defineModel<string>('title', {required: true})

defineProps<{
  active: boolean
}>()

const edit = ref(false);

watch(edit, (newEdit) => {
  if (newEdit) {
    element.value?.focus()
  }
})

const input = () => {
  title.value = element.value?.textContent ?? ''
}

defineEmits<{
  click: []
  remove: []
}>()

</script>

<template>
  <div :class="{'tab-active': active}" class="tab">
    <div ref="element"
         :contenteditable="edit"
         class="prevent-select"
         @click="$emit('click')"
         @dblclick="edit = true"
         @focusout="edit = false"
         @input="input"
         v-text="title"
         @keydown.enter.stop.prevent
         @keyup.enter.stop.prevent="edit = false"></div>

    <div class="tooltip" data-tip="Изтрий автомата">
      <button class="btn btn-outline btn-error btn-xs rounded" @click="$emit('remove')">-</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  padding: 0px 5px;
  font-size: 14px;
  border: transparent 1px dashed;
}

</style>
