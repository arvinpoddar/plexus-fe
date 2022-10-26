<template>
  <!-- LOADING STATE -->
  <q-page v-if="loading" class="full-height full-width flex flex-center">
    <PageLoader />
  </q-page>

  <!-- NO TEAMS STATE-->
  <q-page v-else-if="!teams.length"
    class="full-height full-width flex flex-center no-teams-layout">
    <div class="q-gutter-y-md">
      <img src="~assets/noTeam.svg" alt="" class="no-teams-img" />
      <div>
        Looks like you aren't in any teams. Join one via invite or create your
        own!
      </div>
      <q-btn class="pl-btn" label="Create a team" color="primary"
        @click="showCreateTeamModal" />
    </div>
  </q-page>

  <q-page v-else class="row items-stretch app-layout" style="height: 1px;">
    <NetworkVisualizer class="network-visualizer-outer col"
      @select-doc="setActiveDoc" />
    <DocumentViewer class="col" :docId="activeDocId" @dirty="setDirty(true)"
      @clean="setDirty(false)" />
  </q-page>

</template>

<script>
import Team from 'src/api/models/Team'
import { useQuasar } from 'quasar'
import { defineComponent, onBeforeMount, ref, computed } from 'vue'
import useNotify from 'src/composables/useNotify'

import ConfirmLeaveDocumentModal from 'src/components/Document/ConfirmLeaveDocumentModal'
import DocumentViewer from 'src/components/Document/DocumentViewer.vue'
import NetworkVisualizer from 'src/components/Network/NetworkVisualizer.vue'
import { useCreateTeam } from 'src/composables/useCreateTeam'

export default defineComponent({
  components: {
    DocumentViewer,
    NetworkVisualizer
  },
  setup () {
    const $q = useQuasar()
    const { showError } = useNotify()
    const { showCreateTeamModal } = useCreateTeam()

    const activeTeam = ref(null)
    const teams = ref([])

    const loading = ref(false)
    const loadTeamData = async () => {
      try {
        loading.value = true
        teams.value = await Team.getForUser()
        const curr = await Team.getCurrentTeam()
        if (!curr && teams.value.length) {
          activeTeam.value = teams.value[0]
          await Team.setCurrentTeam(teams.value[0])
        }
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const activeDoc = ref(null)
    const activeDocId = computed(() => activeDoc.value ? activeDoc.value.id : '')

    // Track unsaved changes in active doc
    const activeDocIsDirty = ref(false)

    const setActiveDoc = (doc) => {
      if (doc.id === activeDocId.value) {
        return
      }

      if (activeDocIsDirty.value) {
        $q.dialog({
          component: ConfirmLeaveDocumentModal
        }).onOk(() => {
          activeDoc.value = doc
        })
      } else {
        activeDoc.value = doc
      }
    }

    const setDirty = (val) => {
      activeDocIsDirty.value = val
    }

    onBeforeMount(async () => {
      await loadTeamData()
    })

    return {
      loading,
      teams,
      activeTeam,
      showCreateTeamModal,

      activeDoc,
      activeDocId,
      setActiveDoc,
      setDirty
    }
  }
})
</script>

<style lang="scss">
.no-teams-layout {
  text-align: center;

  .no-teams-img {
    width: 360px;
  }
}

.app-layout {
  height: 1px;
  min-height: 100%;

  .network-visualizer-outer {
    border-right: 1px solid grey;
  }

}
</style>
