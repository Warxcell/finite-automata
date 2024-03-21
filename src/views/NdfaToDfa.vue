<script lang="ts" setup>

import {NonDeterministicFiniteAutomata} from "@/finiteAutomata";
import Graph from "@/components/Graph.vue";
import {computed} from "vue";

const states = [
  'q0',
  'q1',
];

const alphabet = ['H', 'T'];

const initialState = 'q0';

const transitions: [string, string, string][] = [
  ['q0', 'H', 'q0'],
  ['q0', 'T', 'q0'],
  ['q0', 'T', 'q1'],
];
const finalStates = ['q1'];

const ndfa = computed(() => {
  return new NonDeterministicFiniteAutomata(states, alphabet, initialState, transitions, finalStates);
})

</script>
<template>
  <graph :alphabet :finalStates :initialState :transitions :states/>

  <graph :alphabet="ndfa.deterministicFiniteAutomata.alphabet"
         :finalStates="ndfa.deterministicFiniteAutomata.finalStates"
         :initialState="ndfa.deterministicFiniteAutomata.initialState"
         :transitions="ndfa.deterministicFiniteAutomata.transitions"
         :states="ndfa.deterministicFiniteAutomata.states"/>
</template>

<style>

</style>
