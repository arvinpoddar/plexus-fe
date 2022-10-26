<template>
  <div class="flex column network-visualizer-outer">
    <div v-if="!(documents && documents.length)"
      class="col flex column flex-center">
      <img src="~assets/noDocuments.svg" class="no-docs-img q-mb-lg" alt="" />
      <div class="f-bold">Your team doesn't have any documents</div>
      <q-btn class="pl-btn q-mt-lg" color="primary" label="New Doc"
        @click="createDocument" />
    </div>

    <div v-else class="full-height full-width network-visualizer">
      <q-btn v-for="doc in documents" :key="doc.id" :label="doc.name"
        class="pl-btn q-ma-sm" color="primary" @click="selectDocument(doc)" />

      <div class="search-bar">
        <input v-model="query" class="pl-raw-input"
          placeholder="Search network...">
      </div>

      <div class="actions-pane flex column q-gutter-y-sm">
        <q-btn icon="note_add" color="primary" round @click="createDocument" />
        <q-btn icon="link" color="primary" round @click="createDocument" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

import { useQuasar } from 'quasar'
import CreateDocumentModal from 'src/components/Document/CreateDocumentModal.vue'

const SELECT_DOC_EVENT = 'select-doc'
const CREATE_DOC_EVENT = 'create-doc'
const DELETE_DOC_EVENT = 'delete-doc'

export default defineComponent({
  name: 'NetworkVisualizer',
  emits: [SELECT_DOC_EVENT, CREATE_DOC_EVENT, DELETE_DOC_EVENT],
  props: {
    documents: Array
  },
  setup (props, ctx) {
    const $q = useQuasar()

    const query = ref('')

    const createDocument = () => {
      $q.dialog({
        component: CreateDocumentModal
      }).onOk((doc) => {
        ctx.emit(CREATE_DOC_EVENT, doc)
      })
    }

    const selectDocument = (doc) => {
      ctx.emit(SELECT_DOC_EVENT, doc)
    }

    return {
      query,
      selectDocument,
      createDocument
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
