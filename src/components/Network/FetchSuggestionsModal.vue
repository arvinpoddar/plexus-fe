<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="get-suggestions-modal">
    <div class="pl-card modal-sm">
      <q-form @submit="addEdges">
        <div class="pl-card-title q-pr-md">
          <div>Get Suggestions</div>
          <q-space />
          <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
        </div>

        <q-card-section class="q-pt-md q-px-lg q-gutter-y-md">
          <div v-if="loading" class="text-center">
            <q-spinner color="primary" size="36px" class="q-mb-md" />
            <div class="f-bold f-16">
              Fetching docs related to {{ doc.name }}
            </div>
          </div>
          <div v-else-if="!suggestions.length" class="text-center">
            <div class="f-bold f-16">
              No suggestions found for {{ doc.name }}
            </div>
          </div>
          <div v-else>
            Suggested documents related to {{ doc.name }}:
            <q-list class="q-mt-md">
              <q-item
                tag="label"
                v-for="suggestion in suggestions"
                :key="suggestion.id"
                class="suggestion-card"
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selection"
                    :val="suggestion"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    >{{ suggestion.y.name }} ({{
                      getSimilarity(suggestion)
                    }}
                    related)</q-item-label
                  >
                  <q-item-label caption>
                    By {{ suggestion.y.author.first_name }}
                    {{ suggestion.y.author.last_name }}
                  </q-item-label>
                  <q-item-label caption>
                    Last updated:
                    {{
                      formatDate(suggestion.y.last_updated, "MM/DD/YYYY h:mm A")
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <div class="text-right q-pa-md">
          <q-btn
            :loading="creatingEdges"
            :disable="!selection.length"
            label="Add"
            class="pl-btn"
            color="primary"
            type="submit"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, onBeforeMount, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import Team from 'src/api/models/Team'
import useNotify from 'src/composables/useNotify'
import Document from 'src/api/models/Document'
import { formatDate } from 'src/modules/Utils'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  props: {
    doc: Document
  },
  setup (props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const { showError } = useNotify()

    const loading = ref(false)
    const suggestions = ref([])
    const selection = ref([])

    const fetchSuggestions = async () => {
      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        suggestions.value = await props.doc.getSuggestions(team.id)
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const creatingEdges = ref(false)
    const addEdges = async () => {
      const team = await Team.getCurrentTeam()
      const resEdges = []
      try {
        creatingEdges.value = true
        for (const suggestion of selection.value) {
          const edge = suggestion.toEdge()
          try {
            const res = await edge.createForTeam(team.id)
            resEdges.push(res)
          } catch (err) {
            continue
          }
        }
      } catch (err) {
        showError(err)
      } finally {
        creatingEdges.value = false
        onDialogOK(resEdges)
      }
    }

    const getSimilarity = (suggestion) => {
      return (suggestion.similarity * 100).toFixed(2) + '%'
    }

    onBeforeMount(() => {
      fetchSuggestions()
    })

    return {
      // This is REQUIRED;
      // Need to inject these (from useDialogPluginComponent() call)
      // into the vue scope for the vue html template
      dialogRef,
      onDialogHide,

      // other methods that we used in our vue html template;
      // these are part of our example (so not required)
      onOKClick () {
        // on OK, it is REQUIRED to
        // call onDialogOK (with optional payload)
        onDialogOK()
        // or with payload: onDialogOK({ ... })
        // ...and it will also hide the dialog automatically
      },
      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel,

      loading,
      suggestions,
      selection,
      creatingEdges,

      getSimilarity,
      formatDate,
      addEdges
    }
  }
})
</script>

<style lang="scss">
.get-suggestions-modal {
  .pl-card {
    box-shadow: none;

    .suggestion-card {
      border-radius: 10px;
      background-color: #fafafb;
      padding: 12px;
      align-items: center;
      margin-bottom: 10px;
      border: 1px solid #c2c2c2;
    }
  }
}
</style>
