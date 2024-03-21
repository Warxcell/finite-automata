<script lang="ts" setup>

import {graphviz} from 'd3-graphviz';
import {computed, onMounted, type Ref, ref, toRefs, unref, watch} from "vue";
import {digraph, toDot} from 'ts-graphviz';

const props = defineProps<{
  states: string[]
  alphabet: string[]
  transitions: [string, string, string][] | Record<string, Record<string, string>>
  initialState: string | undefined
  finalStates: string[]
  highlightStates?: Record<string, string>
  highlightTransitions?: [string, string, string, string][]
}>()


const {states, transitions, initialState, finalStates, highlightStates, highlightTransitions} = toRefs(props);

const graph: Ref<HTMLDivElement | null> = ref(null)

onMounted(() => {
  if (!graph.value) {
    return
  }
  const graphvizObject = graphviz(graph.value, {
    width: 600,
    height: 600
  });


  const dot = computed(() => {
    const G = digraph('G', {rankdir: "LR"}, (g) => {

      const start = g.node('start', {
        style: 'invis'
      });

      const nodes = states.value.map((state) => {
        return g.node(state, {
          shape: finalStates.value.includes(state) ? 'doublecircle' : 'circle',
          color: highlightStates.value?.[state] ?? 'black'
        });
      })

      const findNode = (name: string) => nodes.find((node) => node.id === name);

      if (initialState.value) {
        const initialStateNode = findNode(initialState.value);
        if (initialStateNode) {
          g.edge([start, initialStateNode])
        }
      }

      if (Array.isArray(transitions.value)) {
        transitions.value.forEach((item) => {
          const highlighTransitionUnref = unref(highlightTransitions);
          const node1 = findNode(item[0]);
          const node2 = findNode(item[2]);
          if (!node1 || !node2) {
            return
          }
          g.edge([node1, node2], {
            label: item[1],
            color: highlighTransitionUnref?.find((highlightTransition) => {
              return highlightTransition?.[0] === item[0] && highlightTransition?.[1] == item[1] && highlightTransition?.[2] == item[2];
            })?.[3] ?? 'black'
          });
        })
      } else {
        Object.entries(transitions.value).forEach((item) => {
          Object.entries(item[1]).forEach((item2) => {
            const highlighTransitionUnref = unref(highlightTransitions);

            const node1 = findNode(item[0]);
            const node2 = findNode(item2[1]);
            if (!node1 || !node2) {
              return
            }
            g.edge([node1, node2], {
              label: item2[0],
              color: highlighTransitionUnref?.find((highlightTransition) => {
                return highlightTransition?.[0] === item[0] && highlightTransition?.[1] == item2[0] && highlightTransition?.[2] == item2[1];
              })?.[3] ?? 'black'
            });
          })
        })
      }

    });
    return toDot(G);
  })

  watch(dot, (dot) => {
    graphvizObject.renderDot(dot);
  }, {
    immediate: true
  })
})
</script>

<template>
  <div ref="graph"></div>
</template>

<style lang="scss">
.links {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1px;

  title {
    font-size: 20px;
  }
}

.nodes circle {
  fill: pink;
  stroke: #000;

}

text {
  pointer-events: none;

}

</style>