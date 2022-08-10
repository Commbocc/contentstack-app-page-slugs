<script setup lang="ts">
import { useChildren } from '../composables/children'
import {
  generateSlugAndUrl,
  openDescendentTree,
  stack,
  acknowledgeDanger,
} from '../lib'
import Child from './Child.vue'

const emit = defineEmits<{
  (e: 'urlUpdated'): Promise<void>
}>()

const props = defineProps<{
  child: any
  parent: any
}>()

const { fetchChildrenOf, children } = useChildren()

fetchChildrenOf(props.child)

const updateUrl = async () => {
  const { url, slug } = await generateSlugAndUrl(props.child, props.parent)

  const { entry: updatedEntry } = await stack.value
    ?.ContentType('page')
    .Entry(props.child.uid)
    .update({
      entry: {
        slug,
        url,
      },
    })

  await emit('urlUpdated')
}

const startsWithUrl = (url: string) => {
  const doesStartWith = url.startsWith(props.parent.url)
  if (!doesStartWith) openDescendentTree.value = true
  return doesStartWith
}

const editLink = (uid: string) => {
  //   console.log(stack)
  const { api_key } = stack.value._data
  return `https://app.contentstack.com/#!/stack/${api_key}/content-type/page/en-us/entry/${uid}/edit`
}
</script>

<template>
  <li>
    <div class="d-flex justify-content-between mb-1">
      <div
        class="text-truncate"
        :class="{ 'text-danger': !startsWithUrl(child.url) }"
        :title="child.url"
      >
        {{ child.title }}

        <small> - {{ child.url }} </small>
      </div>
      <div class="d-flex gap-1">
        <a
          class="btn btn-sm btn-outline-dark"
          :href="editLink(child.uid)"
          target="_blank"
          style="
            --bs-btn-padding-y: 0.2rem;
            --bs-btn-padding-x: 0.25rem;
            --bs-btn-font-size: 0.6rem;
          "
        >
          Edit
        </a>
        <button
          v-if="!startsWithUrl(child.url)"
          class="btn btn-sm btn-outline-danger"
          @click="updateUrl"
          :disabled="!acknowledgeDanger"
          style="
            --bs-btn-padding-y: 0.2rem;
            --bs-btn-padding-x: 0.25rem;
            --bs-btn-font-size: 0.6rem;
          "
        >
          Update
        </button>
      </div>
    </div>

    <div v-if="children.loading" class="d-flex justify-content-center">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <ul v-else class="">
      <Child
        v-for="gchild in children.data"
        :child="gchild"
        :parent="child"
        @url-updated="fetchChildrenOf(child)"
      />
    </ul>
  </li>
</template>
