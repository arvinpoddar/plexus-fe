<template>
  <!-- LOADING STATE -->
  <template v-if="loading">
    <div class="column flex flex-center">
      <PageLoader />
    </div>
  </template>

  <template v-else>
    <div class="flex column network-visualizer">
      <q-btn v-for="doc in documents" :key="doc.id" :label="doc.name"
        color="primary" class="q-ma-sm" @click="selectDoc(doc)" />
    </div>
  </template>

</template>

<script>
import Team from 'src/api/models/Team'
import { defineComponent, onBeforeMount, ref } from 'vue'
import useNotify from 'src/composables/useNotify'

import Document from 'src/api/models/Documents'

const SELECT_DOC_EVENT = 'select-doc'

export default defineComponent({
  name: 'NetworkVisualizer',
  emits: [SELECT_DOC_EVENT],
  setup (props, ctx) {
    const { showError } = useNotify()

    const documents = ref([])

    const loading = ref(false)
    const loadDocuments = async () => {
      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        documents.value = await Document.listForTeam(team.id)
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const selectDoc = (doc) => {
      ctx.emit(SELECT_DOC_EVENT, doc)
    }

    onBeforeMount(async () => {
      await loadDocuments()
    })

    return {
      loading,
      documents,

      selectDoc
    }
  }
})
</script>

<style lang="scss">

</style>
