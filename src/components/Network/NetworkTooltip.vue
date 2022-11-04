<template>
  <div id="tooltip" @click="clickDocument">
    <div v-if="activeElementIsDocument">
      <div class="row items-center">
        <div class="a-fake col ellipsis tooltip-title" @click="selectDocument">
          {{ activeElement.name }}
        </div>
        <q-btn
          size="sm"
          flat
          dense
          color="negative"
          icon="delete"
          @click.stop="deleteDocument"
        />
      </div>
      <div class="ellipsis">By {{ documentAuthorName }}</div>
      <div class="ellipsis">
        Last edited {{ localDate(activeElement.last_updated) }}
      </div>
      <div class="q-mt-sm tooltip-preview">{{ activeElement.content }}</div>
    </div>
    <div v-else-if="activeElementIsEdge">
      <div class="row items-center">
        <div class="col tooltip-title">{{ activeElement.description }}</div>
        <q-btn
          size="sm"
          flat
          dense
          color="negative"
          icon="delete"
          @click.stop="deleteEdge"
        />
      </div>
      <div>
        Connects
        <span class="f-bold">{{ activeElement.connections.from.name }}</span>
        and
        <span class="f-bold">{{ activeElement.connections.to.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import DeleteDocumentModal from 'src/components/Document/DeleteDocumentModal.vue'
import DeleteEdgeModal from 'src/components/Document/DeleteEdgeModal.vue'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'

const DELETE_DOC_EVENT = 'delete-doc'
const DELETE_EDGE_EVENT = 'delete-edge'
const SELECT_DOC_EVENT = 'select-doc'
const CLICK_DOC_EVENT = 'click-doc'

export default defineComponent({
  name: 'NetworkTooltip',
  emits: [DELETE_DOC_EVENT, DELETE_EDGE_EVENT, SELECT_DOC_EVENT],
  props: {
    activeElementType: String,
    activeElement: Object
  },
  setup (props, ctx) {
    const $q = useQuasar()
    const activeElementIsEdge = computed(
      () => props.activeElementType === 'edge'
    )

    const activeElementIsDocument = computed(
      () => props.activeElementType === 'document'
    )

    const documentAuthorName = computed(() => {
      if (activeElementIsDocument.value) {
        return `${props.activeElement.author.first_name} ${props.activeElement.author.last_name}`
      }
      return ''
    })

    const localDate = (dateString) => {
      const d = dayjs(dateString)
      return d.format('MM/DD/YY h:mma')
    }

    const clickDocument = () => {
      ctx.emit(CLICK_DOC_EVENT, { node: props.activeElement.id })
    }

    const selectDocument = () => {
      ctx.emit(SELECT_DOC_EVENT, props.activeElement)
    }

    const deleteDocument = () => {
      $q.dialog({
        component: DeleteDocumentModal,
        componentProps: {
          document: props.activeElement
        }
      }).onOk(() => {
        ctx.emit(DELETE_DOC_EVENT, props.activeElement)
      })
    }

    const deleteEdge = () => {
      $q.dialog({
        component: DeleteEdgeModal,
        componentProps: {
          edge: props.activeElement
        }
      }).onOk(() => {
        ctx.emit(DELETE_EDGE_EVENT, props.activeElement)
      })
    }

    return {
      activeElementIsDocument,
      activeElementIsEdge,
      documentAuthorName,
      localDate,

      deleteDocument,
      deleteEdge,
      selectDocument,
      clickDocument
    }
  }
})
</script>

<style lang="scss">
#tooltip {
  z-index: 5;
  position: absolute;
  background: #fff;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #c2c2c2;
  width: 250px;
  font-size: 13px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);

  .tooltip-title {
    font-size: 14px;
    font-weight: 700;
  }

  .tooltip-preview {
    font-size: 11px;
    font-style: italic;
    color: #c1c1c1;
  }
}
</style>
