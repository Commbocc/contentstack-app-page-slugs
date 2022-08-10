<script setup lang="ts">
import ContentstackAppSdk from '@contentstack/app-sdk'
import {
  state,
  slugFieldData,
  entry,
  initialUrl,
  refreshSlug,
  isNewEntry,
  openDescendentTree,
  acknowledgeDanger,
} from './lib'
import Child from './components/Child.vue'
import { useChildren } from './composables/children'

const { fetchChildrenOf, children } = useChildren()

ContentstackAppSdk.init().then(async (appSdk) => {
  const config = await appSdk?.getConfig()

  // set state
  state.config = config
  state.location = appSdk.location
  state.appSdkInitialized = true

  appSdk.location.CustomField?.frame?.enableAutoResizing()

  slugFieldData.value = appSdk.location?.CustomField?.field?.getData()
  initialUrl.value = entry.value?._data?.url

  await fetchChildrenOf(entry.value._data)

  // events
  entry.value?.onSave(() => fetchChildrenOf(entry.value._data))
  entry.value?.onPublish(() => fetchChildrenOf(entry.value._data))

  //
  state.loading = false
})
</script>

<template>
  <main class="container-fluid my-1">
    <div v-if="state.loading" class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="isNewEntry" class="alert alert-warning" role="alert">
      You must save this entry before generating a slug.
    </div>

    <div v-else class="">
      <!-- input group -->
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          v-model="slugFieldData"
          disabled
          placeholder="page-slug"
          aria-label="Page Slug"
        />

        <button
          @click="refreshSlug"
          title="Refresh Page Slug"
          class="btn btn-outline-primary"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-clockwise"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
            />
            <path
              d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"
            />
          </svg>
        </button>
      </div>

      <!-- child tree -->
      <details :open="openDescendentTree" class="card">
        <summary class="card-header">Descendent Tree</summary>

        <!--  -->
        <div
          class="card-body p-0 bg-warning d-flex justify-content-between align-items-center"
        >
          <div class="form-check small text-dark m-1">
            <input
              class="form-check-input"
              type="checkbox"
              id="acknowledgeDanger"
              v-model="acknowledgeDanger"
            />
            <label class="form-check-label" for="acknowledgeDanger">
              Acknowledge Danger
            </label>
          </div>

          <button
            class="btn btn-light btn-sm"
            style="--bs-btn-border-radius: 0"
            @click="fetchChildrenOf(entry._data)"
          >
            Refresh
          </button>
        </div>

        <!--  -->
        <div class="card-body">
          <div v-if="children.loading" class="d-flex justify-content-center">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <ul v-else class="small mb-0">
            <Child
              v-for="child in children.data"
              :child="child"
              :parent="entry._data"
              @url-updated="fetchChildrenOf(entry._data)"
            />
          </ul>
        </div>
      </details>
    </div>
  </main>
</template>
