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
      >
        <NetworkTooltip
          v-show="showTooltip"
          ref="tooltip"
          :activeElement="activeElement"
          :activeElementType="activeElementType"
          @delete-doc="deleteDocument"
          @delete-edge="deleteEdge"
          @select-doc="selectDocument"
          @click-doc="handleNodeClick"
          @get-suggestions="openSuggestionsModal"
        />
      </div>

      <div class="network-status">
        <div v-if="edgeSelectionMode" class="edge-creation-status">
          <div class="f-14 f-bold">Edge Creation Mode: ON</div>
          <div class="directions">Click two nodes to create an edge</div>
        </div>
      </div>

      <div class="search-bar">
        <PLFieldInput
          v-model="searchQuery"
          @update:model-value="searchNetwork"
          @blur="searchNetwork"
          placeholder="Search network..."
          debounce="150"
          bg-color="white"
          clearable
        />
      </div>

      <div class="controls-pane flex column q-gutter-y-sm">
        <q-btn icon="zoom_in" color="primary" round size="sm" @click="zoomIn" />
        <q-btn
          icon="zoom_out"
          color="primary"
          round
          size="sm"
          @click="zoomOut"
        />
        <q-btn
          icon="center_focus_weak"
          color="primary"
          round
          size="sm"
          @click="zoomReset"
        />
      </div>

      <div class="actions-pane flex column items-center q-gutter-y-md">
        <q-toggle
          v-model="edgeSelectionMode"
          @update:model-value="toggleEdgeSelectionMode"
          icon="link"
          color="primary"
          round
          dense
          size="lg"
        />
        <q-btn icon="note_add" color="primary" round @click="createDocument" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import Sigma from 'sigma'
import Graph from 'graphology'
import circular from 'graphology-layout/circular'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { useQuasar } from 'quasar'
import CreateDocumentModal from 'src/components/Document/CreateDocumentModal.vue'
import CreateEdgeModal from 'src/components/Network/CreateEdgeModal.vue'
import NetworkTooltip from 'src/components/Network/NetworkTooltip.vue'
import useNotify from 'src/composables/useNotify'
import FetchSuggestionsModal from './FetchSuggestionsModal.vue'

const SELECT_DOC_EVENT = 'select-doc'
const CREATE_DOC_EVENT = 'create-doc'
const DELETE_DOC_EVENT = 'delete-doc'
const CREATE_EDGE_EVENT = 'create-edge'
const DELETE_EDGE_EVENT = 'delete-edge'

const NODE_ACTIVE_COLOR = '#176ceb'
const NODE_DEFAULT_COLOR = '#7635b8'
const NODE_INACTIVE_COLOR = '#E2E2E2'
const NODE_SELECTED_COLOR = '#18C97D'

const EDGE_DEFAULT_COLOR = '#C2C2C2'
const EDGE_ACTIVE_COLOR = '#7635b8'
const EDGE_INACTIVE_COLOR = '#EFEFEF'

export default defineComponent({
  name: 'NetworkVisualizer',
  components: {
    NetworkTooltip
  },
  emits: [
    SELECT_DOC_EVENT,
    CREATE_DOC_EVENT,
    DELETE_DOC_EVENT,
    CREATE_EDGE_EVENT,
    DELETE_EDGE_EVENT
  ],
  props: {
    documents: Array,
    edges: Array
  },
  setup (props, ctx) {
    const $q = useQuasar()
    const { showError } = useNotify()

    const searchQuery = ref('')
    const containerRef = ref(null)
    const documentMap = reactive({})
    const edgeMap = reactive({})

    const graph = new Graph()
    let sigma = null
    let camera = null

    const interactionState = reactive({
      hoveredNode: undefined,
      selectedNode: '',
      suggestions: undefined,
      hoveredNeighbors: undefined
    })

    const resetState = () => {
      interactionState.hoveredNode = undefined
      interactionState.selectedNode = ''
      interactionState.suggestions = undefined
      interactionState.hoveredNeighbors = undefined
    }

    const getDocumentWithId = (id) => {
      return documentMap[id] || null
    }

    const getEdgeWithId = (id) => {
      return edgeMap[id] || null
    }

    const tooltip = ref(null)
    const showTooltip = ref(false)
    const activeElementType = ref(null)
    const activeElement = ref(null)

    const displayTooltip = (e, type) => {
      if (type === 'document') {
        activeElement.value = getDocumentWithId(e.node)
      } else if (type === 'edge') {
        activeElement.value = getEdgeWithId(e.edge)
        const [startId, endId] = e.edge.split('-')
        const start = getDocumentWithId(startId)
        const end = getDocumentWithId(endId)
        const edge = getEdgeWithId(e.edge)
        edge.connections = { from: start, to: end }
      }
      activeElementType.value = type
      const mouseEvent = e.event.original
      tooltip.value.$el.style.top = `${mouseEvent.offsetY - 3}px`
      tooltip.value.$el.style.left = `${mouseEvent.offsetX - 3}px`
      showTooltip.value = true
    }

    const hideTooltip = () => {
      activeElement.value = null
      activeElementType.value = null
      showTooltip.value = false
    }

    const createDocument = (firstDoc = false) => {
      $q.dialog({
        component: CreateDocumentModal
      }).onOk(async (doc) => {
        ctx.emit(CREATE_DOC_EVENT, doc)
        if (!sigma) {
          await nextTick()
          renderNetwork()
          await nextTick()
        }
        insertNode(doc, true)
      })
    }

    const selectedDoc = ref(null)
    const selectDocument = (doc) => {
      if (!doc) {
        return
      }
      hideTooltip()
      // Reset previous active doc
      if (selectedDoc.value) {
        graph.setNodeAttribute(selectedDoc.value, 'color', NODE_DEFAULT_COLOR)
      }
      graph.setNodeAttribute(doc.id, 'color', NODE_ACTIVE_COLOR)
      selectedDoc.value = doc.id
      ctx.emit(SELECT_DOC_EVENT, doc)
    }

    const edgeSelectionMode = ref(false)
    const edgeSelections = reactive({ from: null, to: null })

    const toggleEdgeSelectionMode = () => {
      if (!edgeSelectionMode.value) {
        resetEdgeSelections()
      }
    }

    const selectNodeForEdge = (node) => {
      if (!edgeSelectionMode.value) {
        return
      }

      if (!edgeSelections.from) {
        graph.setNodeAttribute(node, 'color', NODE_SELECTED_COLOR)
        edgeSelections.from = node
      } else if (!edgeSelections.to) {
        graph.setNodeAttribute(node, 'color', NODE_SELECTED_COLOR)
        edgeSelections.to = node
      }

      if (edgeSelections.from === edgeSelections.to) {
        resetEdgeSelections()
      } else if (edgeSelections.from && edgeSelections.to) {
        createEdge(edgeSelections.from, edgeSelections.to)
      }
    }

    const createEdge = (nodeStartId, nodeEndId) => {
      const startDoc = getDocumentWithId(nodeStartId)
      const endDoc = getDocumentWithId(nodeEndId)

      const edgeId = [nodeStartId, nodeEndId].sort().join('-')
      if (props.edges.find((e) => e.id === edgeId)) {
        showError(null, 'Edge already exists')
        resetEdgeSelections()
        return
      }

      $q.dialog({
        component: CreateEdgeModal,
        componentProps: {
          from: startDoc,
          to: endDoc
        }
      })
        .onOk((edge) => {
          ctx.emit(CREATE_EDGE_EVENT, edge)
          insertEdge(edge, true)
          resetEdgeSelections()
        })
        .onDismiss(() => {
          resetEdgeSelections()
        })
    }

    const resetEdgeSelections = () => {
      if (edgeSelections.from) {
        graph.setNodeAttribute(
          edgeSelections.from,
          'color',
          NODE_DEFAULT_COLOR
        )
      }
      if (edgeSelections.to) {
        graph.setNodeAttribute(edgeSelections.to, 'color', NODE_DEFAULT_COLOR)
      }
      edgeSelections.from = null
      edgeSelections.to = null
    }

    const changeCursor = (cursor) => {
      if (containerRef.value) {
        containerRef.value.style.cursor = cursor
      }
    }

    const handleNodeClick = (e) => {
      hideTooltip()
      if (edgeSelectionMode.value) {
        selectNodeForEdge(e.node)
      } else {
        const doc = getDocumentWithId(e.node)
        const nodePosition = sigma.getNodeDisplayData(e.node)
        sigma.getCamera().animate(nodePosition, {
          duration: 500
        })
        selectDocument(doc)
      }
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
          interactionState.selectedNode = suggestions[0].id

          // Move the camera to center it on the selected node:
          const nodePosition = sigma.getNodeDisplayData(
            interactionState.selectedNode
          )
          sigma.getCamera().animate(nodePosition, {
            duration: 500
          })
        } else {
          interactionState.selectedNode = undefined
        }
        interactionState.suggestions = new Set(suggestions.map(({ id }) => id))
      } else {
        interactionState.selectedNode = undefined
        interactionState.suggestions = undefined
      }

      // Refresh rendering:
      sigma.refresh()
    }

    const searchNode = (node, query) => {
      const doc = getDocumentWithId(node.id)
      const searchFields = ['name', 'content']
      let documentSearchBody = ''
      for (const field of searchFields) {
        documentSearchBody += doc[field] + '~~~~~'
      }
      if (doc.author) {
        documentSearchBody += `${doc.author.first_name} ${doc.author.last_name}`
      }
      return documentSearchBody.toLowerCase().includes(query)
    }

    // Render nodes accordingly to the internal interactionState:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed

    const setHoveredNode = (node) => {
      if (node) {
        interactionState.hoveredNode = node
        interactionState.hoveredNeighbors = new Set(graph.neighbors(node))
      } else {
        interactionState.hoveredNode = undefined
        interactionState.hoveredNeighbors = undefined
      }
      // Refresh rendering:
      sigma.refresh()
    }

    const setNodeSizes = () => {
      const degrees = graph.nodes().map((node) => graph.degree(node))
      const minDegree = Math.min(...degrees)
      const maxDegree = Math.max(...degrees)
      const minSize = 10,
        maxSize = 15
      graph.forEachNode((node) => {
        const degree = graph.degree(node)
        const size =
          minSize +
          ((degree - minDegree) / (maxDegree - minDegree)) *
            (maxSize - minSize)
        const finalSize = size || minSize
        graph.setNodeAttribute(node, 'size', finalSize)
      })
    }

    const insertNode = (document, forceRender = false) => {
      if (!document || graph.hasNode(document.id)) {
        return
      }
      documentMap[document.id] = document
      graph.addNode(document.id, {
        label: document.name,
        size: 10,
        color: NODE_DEFAULT_COLOR
      })
      if (forceRender) {
        refreshGraph()
      }
    }

    const insertEdge = (edge, forceRender = false) => {
      if (!edge) {
        return
      }
      edgeMap[edge.id] = edge
      graph.addEdgeWithKey(edge.id, edge.x, edge.y, {
        type: 'line',
        label: edge.description,
        size: 5,
        color: EDGE_DEFAULT_COLOR
      })
      if (forceRender) {
        refreshGraph()
      }
    }

    const deleteDocument = (doc) => {
      documentMap[doc.id] = undefined
      graph.dropNode(doc.id)
      ctx.emit(DELETE_DOC_EVENT, doc)
      resetGraph()
    }

    const deleteEdge = (edge) => {
      edgeMap[edge.id] = undefined
      graph.dropEdge(edge.id)
      ctx.emit(DELETE_EDGE_EVENT, edge)
      resetGraph()
    }

    const refreshGraph = () => {
      circular.assign(graph)
      const settings = forceAtlas2.inferSettings(graph)
      forceAtlas2.assign(graph, { settings, iterations: 600 })
      setNodeSizes()
      sigma.refresh()
    }

    const openSuggestionsModal = (docId) => {
      const doc = getDocumentWithId(docId)
      if (!doc) {
        return
      }

      const modal = $q.dialog({
        component: FetchSuggestionsModal,
        componentProps: { doc }
      })

      modal.onOk((edges) => {
        edges.forEach((edge, index) => {
          insertEdge(edge)
          if (index === edges.length - 1) {
            refreshGraph()
          }
        })
      })
    }

    const resetGraph = () => {
      resetState()
      hideTooltip()
      refreshGraph()
      zoomReset()
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

    const renderNetwork = () => {
      const container = containerRef.value
      if (!container) {
        return
      }

      for (const document of props.documents) {
        try {
          insertNode(document)
        } catch (err) {
          console.error(err)
        }
      }

      for (const edge of props.edges) {
        try {
          insertEdge(edge)
        } catch (err) {
          console.error(err)
        }
      }

      setNodeSizes()

      circular.assign(graph)
      const settings = forceAtlas2.inferSettings(graph)
      forceAtlas2.assign(graph, { settings, iterations: 600 })

      // Instanciate sigma:
      sigma = new Sigma(graph, containerRef.value, {
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        renderEdgeLabels: true,
        enableEdgeHovering: true,
        allowInvalidContainer: true,
        enableEdgeClickEvents: true,
        enableEdgeWheelEvents: true,
        enableEdgeHoverEvents: 'debounce'
      })

      camera = sigma.getCamera()

      sigma.on('enterNode', (e) => {
        changeCursor('pointer')
        displayTooltip(e, 'document')
      })

      sigma.on('leaveNode', (e) => {
        changeCursor('auto')
        hideTooltip()
      })

      sigma.on('enterEdge', (e) => {
        changeCursor('pointer')
        displayTooltip(e, 'edge')
        graph.setEdgeAttribute(e.edge, 'color', EDGE_ACTIVE_COLOR)
      })

      sigma.on('leaveEdge', (e) => {
        changeCursor('auto')
        hideTooltip()
        graph.setEdgeAttribute(e.edge, 'color', EDGE_DEFAULT_COLOR)
      })

      sigma.on('clickNode', (e) => handleNodeClick(e))

      sigma.on('enterNode', ({ node }) => {
        setHoveredNode(node)
      })

      sigma.on('leaveNode', () => {
        setHoveredNode(undefined)
      })

      sigma.setSetting('nodeReducer', (node, data) => {
        const res = { ...data }

        if (
          interactionState.hoveredNeighbors &&
          !interactionState.hoveredNeighbors.has(node) &&
          interactionState.hoveredNode !== node
        ) {
          res.label = undefined
          res.color = NODE_INACTIVE_COLOR
        }

        if (interactionState.selectedNode === node) {
          res.highlighted = true
        } else if (
          interactionState.suggestions &&
          !interactionState.suggestions.has(node)
        ) {
          res.label = undefined
          res.color = NODE_INACTIVE_COLOR
        }

        return res
      })

      // Render edges accordingly to the internal interactionState:
      // 1. If a node is hovered, the edge is hidden if it is not connected to the
      //    node
      // 2. If there is a query, the edge is only visible if it connects two
      //    suggestions
      sigma.setSetting('edgeReducer', (edge, data) => {
        const res = { ...data }

        if (
          interactionState.hoveredNode &&
          !graph.hasExtremity(edge, interactionState.hoveredNode)
        ) {
          res.color = EDGE_INACTIVE_COLOR
        }

        if (
          interactionState.suggestions &&
          (!interactionState.suggestions.has(graph.source(edge)) ||
            !interactionState.suggestions.has(graph.target(edge)))
        ) {
          res.color = EDGE_INACTIVE_COLOR
        }

        return res
      })
    }

    onMounted(async () => {
      // renderNetwork()
      await nextTick()
      renderNetwork()
    })

    return {
      tooltip,
      showTooltip,
      activeElement,
      activeElementType,

      edgeSelectionMode,
      toggleEdgeSelectionMode,

      searchQuery,
      containerRef,

      selectDocument,
      createDocument,
      renderNetwork,
      searchNetwork,
      deleteDocument,
      handleNodeClick,
      deleteEdge,
      zoomIn,
      zoomOut,
      zoomReset,

      openSuggestionsModal
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

    .network-status {
      position: absolute;
      z-index: 1;
      top: 15px;
      left: 15px;

      .edge-creation-status {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #c2c2c2;
        padding: 5px;
        .directions {
          font-size: 11px;
        }
      }
    }

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
