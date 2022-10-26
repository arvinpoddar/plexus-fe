<template>
  <template v-if="loading">
    <div class="column flex flex-center">
      <PageLoader />
    </div>
  </template>

  <template v-else-if="document">
    <div class="flex column document-viewer"
      :class="{ 'fullscreen': fullscreen }">
      <div class="document-viewer-menu row items-center">
        <q-btn class="q-mr-sm" :icon="fullscreenIcon" no-caps dense flat
          @click="toggleFullscreen" />
        <div class="f-bold document-title">
          {{ document.name }}
        </div>
        <q-space />
        <div class="q-gutter-x-xs">
          <q-btn v-if="!fullscreen" :icon="modeIcon" no-caps dense flat
            @click="toggleMode" />
          <q-btn icon="save" no-caps dense flat />
          <q-btn icon="download" no-caps dense flat @click="downloadDocument" />
        </div>
      </div>
      <div class="col editor-panels row">
        <MarkdownEditor v-show="showEditor" class="col"
          :source="document.content" @local-edit="editDocumentLocally"
          @save="saveDocument" />
        <MarkdownRenderer v-show="showViewer" class="col"
          :source="document.content" />
      </div>
    </div>
  </template>

  <template v-else>
    <div class="column flex flex-center">
      <img src="~assets/badge-theme.png" class="get-started-img q-mb-lg"
        alt="" />
      Select a document from the graph to get started
    </div>
  </template>
</template>

<script>
import { defineComponent, onBeforeMount, ref, watch, computed, onMounted } from 'vue'
import MarkdownRenderer from 'src/components/Document/MarkdownRenderer'
import MarkdownEditor from 'src/components/Document/MarkdownEditor'
import DownloadDocumentModal from './DownloadDocumentModal'
import Plexus from 'src/api'
import useNotify from 'src/composables/useNotify'
import { useQuasar } from 'quasar'
import Document from 'src/api/models/Documents'
import Team from 'src/api/models/Team'

const MODES = {
  EDIT: 'e',
  VIEW: 'v'
}

const DIRTY_EVENT = 'dirty'
const CLEAN_EVENT = 'clean'

export default defineComponent({
  name: 'MarkdownViewer',
  emits: [DIRTY_EVENT, CLEAN_EVENT],
  components: {
    MarkdownRenderer,
    MarkdownEditor
  },
  props: {
    docId: String
  },
  setup (props, ctx) {
    const $q = useQuasar()
    const { showError } = useNotify()

    const loading = ref(false)
    const document = ref(null)
    const currentUser = ref(null)

    const mode = ref(MODES.VIEW)

    const toggleMode = () => {
      if (mode.value === MODES.VIEW) {
        mode.value = MODES.EDIT
      } else if (mode.value === MODES.EDIT) {
        mode.value = MODES.VIEW
      }
    }

    const modeIcon = computed(() => {
      switch (mode.value) {
        case MODES.EDIT:
          return 'visibility'
        case MODES.VIEW:
          return 'edit'
        default:
          return 'visibility'
      }
    })

    const fullscreen = ref(false)

    const toggleFullscreen = () => {
      fullscreen.value = !fullscreen.value
    }

    const fullscreenIcon = computed(() => fullscreen.value ? 'close_fullscreen' : 'fullscreen')

    const showEditor = computed(() => /* TODO: isDocumentAuthor.value && */(mode.value === MODES.EDIT || fullscreen.value))

    const showViewer = computed(() => mode.value === MODES.VIEW || fullscreen.value)

    const isDocumentAuthor = computed(() => {
      return document.value && currentUser.value && document.value.author === currentUser.value.id
    })

    const fetchDocument = async (docId) => {
      if (!docId) {
        return
      }

      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        document.value = await Document.get(team.id, props.docId)
        ctx.emit(CLEAN_EVENT)
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const editDocumentLocally = (e) => {
      if (document.value) {
        document.value.content = e.content
        ctx.emit(DIRTY_EVENT)
      }
    }

    const saveDocument = () => {
      console.log('saving document')
      ctx.emit(CLEAN_EVENT)
    }

    const downloadDocument = () => {
      if (!document.value) {
        return
      }

      $q.dialog({
        component: DownloadDocumentModal,
        componentProps: {
          document: document.value
        }
      })
    }

    onBeforeMount(async () => {
      currentUser.value = await Plexus.Auth.getUserData()
    })

    onMounted(() => fetchDocument(props.docId))

    watch(() => props.docId, (id) => {
      mode.value = MODES.VIEW
      fetchDocument(id)
    })

    return {
      loading,
      document,
      isDocumentAuthor,

      MODES,
      mode,
      toggleMode,
      modeIcon,

      showEditor,
      showViewer,
      fullscreen,
      toggleFullscreen,
      fullscreenIcon,

      fetchDocument,
      editDocumentLocally,
      saveDocument,
      downloadDocument
    }
  }
})
</script>

<style lang="scss">
.document-viewer {
  border-left: 1px solid grey;

  .document-viewer-menu {
    padding: 10px;
    background: #fff;
  }
}

.get-started-img {
  width: 100%;
  max-width: 150px;
}

.document-viewer.fullscreen {
  border-left: 0px;
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
