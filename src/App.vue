<script setup lang="ts">
import { unref, watch } from 'vue'
import ContentstackAppSdk from '@contentstack/app-sdk'
import {
  state,
  slugFieldData,
  entry,
  refreshSlug,
  updateChildrenOf,
  isNewEntry,
} from './lib'

watch(
  () => slugFieldData.value,
  async () => {
    await state.location?.CustomField?.field?.setData(unref(slugFieldData))
  }
)

ContentstackAppSdk.init().then(async (appSdk) => {
  const config = await appSdk?.getConfig()

  // set state
  state.config = config
  state.location = appSdk.location
  state.appSdkInitialized = true

  appSdk.location.CustomField?.frame?.enableAutoResizing()

  slugFieldData.value = appSdk.location?.CustomField?.field?.getData()

  // events
  entry.value?.onSave(updateChildrenOf)
  entry.value?.onPublish(updateChildrenOf)

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

    <div v-else class="d-flex gap-1">
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
    </div>
  </main>
</template>
