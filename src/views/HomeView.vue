<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import FiniteAutomata from "@/components/FiniteAutomata.vue";
import TabTitle from "@/components/TabTitle.vue";
import {useFiniteAutomataStore} from "@/stores/finiteAutomataStore";
import {storeToRefs} from "pinia";
import {useRouteHash} from "@vueuse/router";
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue";

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

const hash = useRouteHash()

if (hash.value) {
  // const parsed = typia.json.assertParse<typeof items>(hash.value.substring(1));
  items.value = JSON.parse(hash.value.substring(1));
}

const shareButtonTextOG = 'Сподели'
const shareButtonText = ref(shareButtonTextOG)

watch(items, (newItems) => {
  // hash.value = `#${typia.json.stringify(items.value)}`
  hash.value = `#${JSON.stringify(newItems)}`
}, {
  immediate: !hash.value,
  deep: true
})

const url = computed(() => `${window.location.origin}${window.location.pathname}${hash.value}`)

const share = () => {
  navigator.share({
    url: url.value
  })
}
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-center mb-3 text-3xl">
      Симулация на крайни автомати
    </h1>

    <CopyToClipboardButton :text="url" btn-text="Сподели" @click="share"/>

    <div class="tabs tabs-lifted" role="tablist">
      <template v-for="(item, key) in items">
        <TabTitle
            v-model:title="item.name"
            :active="activeTab === key"
            @click="activeTab = key"
            @remove="remove(key)"/>

        <div v-if="activeTab === key" class="tab-content border-base-300 rounded-box p-6" role="tabpanel">
          <FiniteAutomata
              v-model:alphabet="item.alphabet"
              v-model:final-states="item.finalStates"
              v-model:initial-state="item.initialState"
              v-model:states="item.states"
              v-model:transitions="item.transitions"
              v-model:type="item.type"
              v-model:words="item.words"
              :name="item.name"
          />
        </div>
      </template>

      <div class="tab">
        <div class="tooltip" data-tip="Добави нов прозорец с автомат">
          <button class="btn btn-success btn-xs btn-outline rounded" @click="add">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.tabs-boxed {
  border-radius: var(--rounded-btn, 0.5rem);
  --tw-bg-opacity: transparent;
  background-color: transparent;
  padding: 0;
}

.tab-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
