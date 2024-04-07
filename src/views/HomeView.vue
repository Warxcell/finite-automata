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
  <div class="mobile-note my-20 px-3 text-5xl text-center">
    Приложението не се поддържа на мобилни устройства
  </div>
  <div class="container mx-auto px-6">
    <div class="py-10 px-6 flex flex-wrap text-center justify-between">
      <h1 class="mb-3 text-3xl">
        Симулация на крайни автомати
      </h1>

      <CopyToClipboardButton :text="url" btn-text="Сподели" @click="share"/>
    </div>

    <div class="tabs tabs-info" role="tablist">
      <template v-for="(item, key) in items">
        <TabTitle
            v-model:title="item.name"
            :active="activeTab === key"
            @click="activeTab = key"
            @remove="remove(key)"/>

        <div v-if="activeTab === key" class="tab-content border-slate-600 rounded-box p-3" role="tabpanel">
          <div class="flex flex-wrap gap-3">
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
        </div>
      </template>

      <div class="tab py-2">
        <div class="tooltip w-full" data-tip="Добави нов прозорец с автомат">
          <button class="btn btn-success btn-block btn-xs btn-outline rounded" @click="add">Добави +</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  align-items: start;
  grid-template-columns: 20% 80%;
}

.tab {
  border-radius: 5px 0 0 5px;
  border-right: none;
  right: -1px;
  top: -1px;
  grid-row: auto;
  line-height: 1.3em;
  height: auto;
}

.tab-content {
  grid-column: 2;
  grid-row: 1 / 1000;
  height: 100%;
}

.mobile-note {
  display: none;
}

@media only screen and (max-width: 767px) {
  body {
    overflow: hidden;

    .container {
      display: none;
    }

    .mobile-note {
      display: block;
    }
  }
}
</style>
