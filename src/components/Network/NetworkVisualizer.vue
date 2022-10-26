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

      <q-btn label="Create" class="pl-btn" color="positive"
        @click="createDocument" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

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
}
</style>
