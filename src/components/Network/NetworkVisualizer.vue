<template>
  <div class="flex column network-visualizer-outer">
    <div
      v-if="!(documents && documents.length)"
      class="col flex column flex-center"
    >
      <img src="~assets/noDocuments.svg" class="no-docs-img q-mb-lg" alt="" />
      <div class="f-bold">Your team doesn't have any documents</div>
      <q-btn
        class="pl-btn q-mt-lg"
        color="primary"
        label="New Doc"
        @click="createDocument"
      />
    </div>

    <div v-else class="full-height full-width network-visualizer">
      <div
        ref="containerRef"
        id="sigma-container"
        class="full-height full-width"
      />

      <!--
      <q-btn
        v-for="doc in documents"
        :key="doc.id"
        :label="doc.name"
        class="pl-btn q-ma-sm"
        color="primary"
        @click="selectDocument(doc)"
      />
      -->

      <div class="search-bar">
        <input
          v-model="searchQuery"
          @input="searchNetwork"
          @blur="searchNetwork"
          class="pl-raw-input"
          placeholder="Search network..."
        />
      </div>

      <div class="controls-pane flex column q-gutter-y-sm">
        <q-btn icon="zoom_in" color="primary" round @click="zoomIn" size="sm" />
        <q-btn
          icon="zoom_out"
          color="primary"
          round
          @click="zoomOut"
          size="sm"
        />
        <q-btn
          icon="center_focus_weak"
          color="primary"
          round
          @click="zoomReset"
          size="sm"
        />
      </div>

      <div class="actions-pane flex column q-gutter-y-sm">
        <q-btn icon="note_add" color="primary" round @click="createDocument" />
        <q-btn icon="link" color="primary" round @click="createDocument" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import Sigma from 'sigma'
import Graph from 'graphology'
import circular from 'graphology-layout/circular'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { useQuasar } from 'quasar'
import CreateDocumentModal from 'src/components/Document/CreateDocumentModal.vue'

const SELECT_DOC_EVENT = 'select-doc'
const CREATE_DOC_EVENT = 'create-doc'
const DELETE_DOC_EVENT = 'delete-doc'

const NODE_ACTIVE_COLOR = '#EF382C'
const NODE_INACTIVE_COLOR = '#E2E2E2'

export default defineComponent({
  name: 'NetworkVisualizer',
  emits: [SELECT_DOC_EVENT, CREATE_DOC_EVENT, DELETE_DOC_EVENT],
  props: {
    documents: Array,
    edges: Array
  },
  setup (props, ctx) {
    const $q = useQuasar()

    const searchQuery = ref('')

    const createDocument = () => {
      $q.dialog({
        component: CreateDocumentModal
      }).onOk((doc) => {
        ctx.emit(CREATE_DOC_EVENT, doc)
      })
    }

    const selectDocument = (doc) => {
      if (doc) {
        ctx.emit(SELECT_DOC_EVENT, doc)
      }
    }

    const getDocumentWithId = (id) => {
      return props.documents.find((d) => d.id === id) || null
    }

    const containerRef = ref(null)
    const graph = new Graph()
    let sigma = null
    let camera = null
    const state = reactive({
      hoveredNode: undefined,
      selectedNode: '',
      suggestions: undefined,
      hoveredNeighbors: undefined
    })

    const renderNetwork = () => {
      const container = containerRef.value
      if (!container) {
        return
      }

      for (const document of props.documents) {
        insertNode(document)
      }

      graph.addEdge('rnQtwTR9Kx5mXkGKv8tl', 'vXJD8CLWBPV04Fytk75L', {
        type: 'line',
        label: 'test',
        size: 5
      })

      /*
      const degrees = graph.nodes().map((node) => graph.degree(node))
      const minDegree = Math.min(...degrees)
      const maxDegree = Math.max(...degrees)
      const minSize = 10,
        maxSize = 15
      graph.forEachNode((node) => {
        const degree = graph.degree(node)
        graph.setNodeAttribute(
          node,
          'size',
          minSize +
            ((degree - minDegree) / (maxDegree - minDegree)) *
              (maxSize - minSize)
        )
      })
      */

      circular.assign(graph)
      const settings = forceAtlas2.inferSettings(graph)
      forceAtlas2.assign(graph, { settings, iterations: 600 })

      // Instanciate sigma:
      sigma = new Sigma(graph, containerRef.value, {
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        renderEdgeLabels: true,
        enableEdgeHovering: true,
        allowInvalidContainer: true
      })

      camera = sigma.getCamera()

      sigma.on('clickNode', (e) => {
        const doc = getDocumentWithId(e.node)
        selectDocument(doc)
      })
      sigma.on('clickEdge', (e) => {
        console.log(e)
      })

      sigma.on('enterNode', ({ node }) => {
        setHoveredNode(node)
      })
      sigma.on('leaveNode', () => {
        setHoveredNode(undefined)
      })

      sigma.setSetting('nodeReducer', (node, data) => {
        const res = { ...data }

        if (
          state.hoveredNeighbors &&
          !state.hoveredNeighbors.has(node) &&
          state.hoveredNode !== node
        ) {
          res.label = undefined
          res.color = NODE_INACTIVE_COLOR
        }

        if (state.selectedNode === node) {
          res.highlighted = true
        } else if (state.suggestions && !state.suggestions.has(node)) {
          res.label = undefined
          res.color = NODE_INACTIVE_COLOR
        }

        return res
      })

      // Render edges accordingly to the internal state:
      // 1. If a node is hovered, the edge is hidden if it is not connected to the
      //    node
      // 2. If there is a query, the edge is only visible if it connects two
      //    suggestions
      sigma.setSetting('edgeReducer', (edge, data) => {
        const res = { ...data }

        if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
          res.hidden = true
        }

        if (
          state.suggestions &&
          (!state.suggestions.has(graph.source(edge)) ||
            !state.suggestions.has(graph.target(edge)))
        ) {
          res.hidden = true
        }

        return res
      })
    }

    const searchNetwork = () => {
      const query = searchQuery.value
      if (query) {
        const lcQuery = query.toLowerCase()
        const suggestions = graph
          .nodes()
          .map((n) => ({ id: n, label: graph.getNodeAttribute(n, 'label') }))
          .filter((n) => searchNode(n, lcQuery))

        if (suggestions.length === 1) {
          state.selectedNode = suggestions[0].id

          // Move the camera to center it on the selected node:
          const nodePosition = sigma.getNodeDisplayData(state.selectedNode)
          sigma.getCamera().animate(nodePosition, {
            duration: 500
          })
        } else {
          state.selectedNode = undefined
        }
        state.suggestions = new Set(suggestions.map(({ id }) => id))
      } else {
        state.selectedNode = undefined
        state.suggestions = undefined
      }

      // Refresh rendering:
      sigma.refresh()
    }

    const searchNode = (node, query) => {
      const searchFields = ['label']
      let nodeSearchBody = ''
      for (const field of searchFields) {
        nodeSearchBody += node[field] + '~~~~~'
      }
      return nodeSearchBody.toLowerCase().includes(query)
    }

    // Render nodes accordingly to the internal state:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed

    function setHoveredNode (node) {
      if (node) {
        state.hoveredNode = node
        state.hoveredNeighbors = new Set(graph.neighbors(node))
      } else {
        state.hoveredNode = undefined
        state.hoveredNeighbors = undefined
      }

      // Refresh rendering:
      sigma.refresh()
    }

    const insertNode = (document, forceRender = false) => {
      if (!document) {
        return
      }
      graph.addNode(document.id, {
        label: document.name,
        size: 10,
        color: NODE_ACTIVE_COLOR
      })

      if (forceRender) {
        sigma.refresh()
      }
    }

    /**
     * Camera zoom controls
     */
    const zoomIn = () => {
      camera?.animatedZoom({ duration: 600 })
    }

    const zoomOut = () => {
      camera?.animatedUnzoom({ duration: 600 })
    }

    const zoomReset = () => {
      camera?.animatedReset({ duration: 600 })
    }

    onMounted(async () => {
      // renderNetwork()
      await nextTick()
      renderNetwork()
    })

    watch(
      () => props.documents,
      (val) => {
        if (!graph) {
          return
        }
        const newDocs = val.filter((d) => !graph.nodes(d.id))
        console.log(newDocs)
        newDocs.forEach((d) => insertNode(d))
      },
      { deep: true }
    )

    return {
      searchQuery,
      containerRef,
      selectDocument,
      createDocument,

      renderNetwork,
      searchNetwork,

      zoomIn,
      zoomOut,
      zoomReset
    }
  }
})
</script>

<style lang="scss">
.network-visualizer-outer {
  .no-docs-img {
    width: 100%;
    max-width: 200px;
  }

  .network-visualizer {
    position: relative;

    .actions-pane {
      position: absolute;
      z-index: 1;
      bottom: 15px;
      right: 15px;
    }

    .controls-pane {
      position: absolute;
      z-index: 1;
      bottom: 15px;
      left: 15px;
    }

    .search-bar {
      position: absolute;
      width: 33%;
      z-index: 1;
      top: 15px;
      right: 15px;

      input {
        width: 100%;
      }
    }
  }
}
</style>
