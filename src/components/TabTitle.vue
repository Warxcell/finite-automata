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
  <div class="tab-item">
    <div ref="element"
         :class="{active: active}"
         :contenteditable="edit"
         class="prevent-select"
         @click="$emit('click')"
         @dblclick="edit = true"
         @focusout="edit = false"
         @input="input"
         v-text="title"
         @keydown.enter.stop.prevent
         @keyup.enter.stop.prevent="edit = false"></div>

    <button class="btn-remove" @click="$emit('remove')">-</button>
  </div>
</template>

<style lang="scss" scoped>
.tab-item {
  align-items: center;
  display: flex;
  gap: 2px;
  padding-bottom: 5px;
  border-bottom: solid 1px #4d99ff;
}

.btn-remove {
  background: transparent;
  border: solid 1px #f00;
  border-radius: 3px;
  cursor: pointer;
  color: #f00;
  line-height: 13px;
  padding: 0 4px;
}

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  padding: 0px 5px;
  font-size: 14px;
  border: transparent 1px dashed ;
}

.active {
  border-color: green;
}
</style>
