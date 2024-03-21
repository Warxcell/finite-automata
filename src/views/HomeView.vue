<script lang="ts" setup>
import {ref} from "vue";
import FiniteAutomata from "@/components/FiniteAutomata.vue";
import TabTitle from "@/components/TabTitle.vue";
import {useFiniteAutomataStore} from "@/stores/finiteAutomataStore";
import {storeToRefs} from "pinia";

const itemsStore = useFiniteAutomataStore();

const {items} = storeToRefs(itemsStore);

const activeTab = ref<number>(0);

const add = () => {
  itemsStore.add()
  activeTab.value = items.value.length - 1
}

const remove = (index: number) => {
  itemsStore.remove(index)

  if (activeTab.value > items.value.length - 1) {
    activeTab.value = items.value.length - 1
  }
}
</script>

<template>
  <div class="container">
    <h1 class="main-title">Симулация на крайни автомати</h1>

    <div>
      <TabTitle v-for="(item, key) in items"
                v-model:title="item.name"
                :active="activeTab === key"
                @click="activeTab = key"
                @remove="remove(key)"/>
    </div>
    <button @click="add">+</button>
  </div>

  <div v-for="(item, key) in items">
    <FiniteAutomata v-if="activeTab === key"
                    v-model:alphabet="item.alphabet"
                    v-model:final-states="item.finalStates"
                    v-model:initial-state="item.initialState"
                    v-model:states="item.states"
                    v-model:transitions="item.transitions"
                    v-model:type="item.type"
                    v-model:words="item.words"
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.main-title {
  flex: 0 0 100%;
  text-align: center;
}
</style>
