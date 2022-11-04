<template>
  <template v-if="loading">
    <div class="column flex flex-center">
      <PageLoader />
    </div>
  </template>

  <template v-else-if="document">
    <div
      class="flex column document-viewer"
      :class="{ fullscreen: fullscreen }"
    >
      <!-- MENU BAR -->
      <div class="document-viewer-menu row items-center">
        <q-btn
          class="q-mr-sm"
          :icon="fullscreenIcon"
          no-caps
          dense
          flat
          @click="toggleFullscreen"
        />

        <!-- DOC INFO HEADER -->
        <div class="document-header ellipsis">
          <div class="f-bold document-title">
            {{ document.name }}
          </div>
          <div class="document-subtitle">
            Updated by {{ documentAuthorName }} @ {{ lastUpdatedDate }}
          </div>
        </div>
        <q-space />

        <!-- DOCUMENT ACTIONS -->
        <div class="q-gutter-x-xs">
          <q-btn
            v-if="isDocumentAuthor && !fullscreen"
            :icon="modeIcon"
            no-caps
            dense
            flat
            @click="toggleMode"
          />
          <q-btn
            v-if="isDocumentAuthor"
            icon="save"
            no-caps
            dense
            flat
            :loading="saving"
            @click="saveDocument"
          />
          <q-btn icon="download" no-caps dense flat @click="downloadDocument" />
        </div>
        <q-separator v-if="isDocumentAuthor" vertical class="q-mx-md" />
        <q-btn
          v-if="isDocumentAuthor"
          icon="delete"
          color="negative"
          no-caps
          dense
          flat
          :loading="deleting"
          @click="deleteDocument"
        />
      </div>

      <div class="col editor-panels row">
        <MarkdownEditor
          v-show="showEditor"
          class="editor-outer col"
          :source="document.content"
          @local-edit="editDocumentLocally"
          @save="saveDocument"
        />
        <MarkdownRenderer
          v-show="showViewer"
          class="renderer-outer col"
          :source="document.content"
        />
      </div>
    </div>
  </template>

  <template v-else>
    <div class="column flex flex-center">
      <img
        src="~assets/noActiveDoc.svg"
        class="get-started-img q-mb-lg"
        alt=""
      />
      <span class="f-bold">Select a document from the graph</span>
    </div>
  </template>
</template>

<script>
import {
  defineComponent,
  onBeforeMount,
  ref,
  watch,
  computed,
  onMounted
} from 'vue'
import MarkdownRenderer from 'src/components/Document/MarkdownRenderer.vue'
import MarkdownEditor from 'src/components/Document/MarkdownEditor.vue'
import DownloadDocumentModal from 'src/components/Document/DownloadDocumentModal.vue'
import DeleteDocumentModal from 'src/components/Document/DeleteDocumentModal.vue'
import Plexus from 'src/api'
import useNotify from 'src/composables/useNotify'
import { useQuasar } from 'quasar'
import Document from 'src/api/models/Document'
import Team from 'src/api/models/Team'
import dayjs from 'dayjs'
import { strictAssign } from 'src/modules/Utils'

const MODES = {
  EDIT: 'e',
  VIEW: 'v'
}

const DIRTY_EVENT = 'dirty'
const CLEAN_EVENT = 'clean'
const DELETE_EVENT = 'delete-doc'

export default defineComponent({
  name: 'MarkdownViewer',
  emits: [DIRTY_EVENT, CLEAN_EVENT, DELETE_EVENT],
  components: {
    MarkdownRenderer,
    MarkdownEditor
  },
  props: {
    docId: String
  },
  setup (props, ctx) {
    const $q = useQuasar()
    const { showError, showSuccess } = useNotify()

    const loading = ref(false)
    const document = ref(null)

    const currentTeam = ref(null)
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

    const fullscreenIcon = computed(() =>
      fullscreen.value ? 'close_fullscreen' : 'fullscreen'
    )

    const showEditor = computed(
      () =>
        isDocumentAuthor.value &&
        (mode.value === MODES.EDIT || fullscreen.value)
    )

    const showViewer = computed(
      () => mode.value === MODES.VIEW || fullscreen.value
    )

    const documentAuthor = computed(() => {
      if (document.value && document.value.author) {
        return document.value.author
      }
      return null
    })

    const documentAuthorName = computed(() => {
      if (documentAuthor.value) {
        return `${documentAuthor.value.first_name} ${documentAuthor.value.last_name}`
      }
      return ''
    })

    const isDocumentAuthor = computed(() => {
      if (documentAuthor.value) {
        return documentAuthor.value.id === currentUser.value.id
      }
      return false
    })

    const lastUpdatedDate = computed(() => {
      if (document.value) {
        const d = dayjs(document.value.last_updated)
        return d.format('MM/DD/YY h:mm A')
      }
      return ''
    })

    const fetchDocument = async (docId) => {
      try {
        loading.value = true
        document.value = await Document.get(currentTeam.value.id, docId)
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

    const saving = ref(false)
    const saveDocument = async () => {
      try {
        saving.value = true
        const res = await document.value.saveForTeam(currentTeam.value.id)
        strictAssign(document.value, res)
        showSuccess(res, 'Saved changes!')
        ctx.emit(CLEAN_EVENT)
      } catch (err) {
        showError(err)
      } finally {
        saving.value = false
      }
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

    const deleting = ref(false)
    const deleteDocument = (docId) => {
      $q.dialog({
        component: DeleteDocumentModal,
        componentProps: {
          document: document.value
        }
      }).onOk(() => {
        ctx.emit(DELETE_EVENT, document.value)
      })
    }

    onBeforeMount(async () => {
      currentUser.value = await Plexus.Auth.getUserData()
      currentTeam.value = await Team.getCurrentTeam()
    })

    const changeDocument = (id) => {
      if (id) {
        fetchDocument(id)
      } else {
        document.value = null
      }
    }

    onMounted(() => {
      changeDocument(props.docId)
    })

    watch(
      () => props.docId,
      (id) => {
        mode.value = MODES.VIEW
        changeDocument(id)
      }
    )

    return {
      loading,
      document,

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
      downloadDocument,

      documentAuthor,
      documentAuthorName,
      isDocumentAuthor,

      lastUpdatedDate,

      saving,
      saveDocument,

      deleting,
      deleteDocument
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

    .document-header {
      .document-subtitle {
        font-size: 11px;
        color: grey;
      }
    }
  }
}

.get-started-img {
  width: 100%;
  max-width: 200px;
}

.document-viewer.fullscreen {
  border-left: 0px;
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
