import { computed, reactive, ref, unref, watch } from 'vue'
import { slugify } from '../util'
import type Extension from '@contentstack/app-sdk/dist/src/extension'

export const state = reactive<{
  loading: boolean
  config: any
  location: Extension['location'] | undefined
  appSdkInitialized: boolean
}>({
  loading: true,
  config: {},
  location: undefined,
  appSdkInitialized: false,
})

export const stack = computed(() => state.location?.CustomField?.stack)
export const entry = computed(() => state.location?.CustomField?.entry)

export const slugFieldData = ref('')
export const isNewEntry = computed<boolean>(
  () => Object.entries(entry.value?._data || {}).length === 0
)
export const initialUrl = ref('')
export const openDescendentTree = ref(false)
export const acknowledgeDanger = ref(false)

export const children = reactive<{
  loading: boolean
  data: Entry[]
}>({
  loading: true,
  data: [],
})

export async function refreshSlug() {
  const { url, slug } = await generateSlugAndUrl(
    entry.value._changedData || entry.value._data
  )
  slugFieldData.value = slug
  entry.value.getField('url').setData(url)
}

export async function generateSlugAndUrl(_entry: Entry, _parent?: Entry) {
  // find parent page if not passed as an argument
  const parent = _parent ?? (await getParent(_entry))
  const slug = slugify(_entry.title)
  const url = [parent?.url, slug].join('/')
  return { slug, url }
}

export const getParent = async (_entry: Entry): Promise<Entry | null> => {
  const [_parent] = _entry.parent?.page || []
  if (!_parent) return null

  const { entry: parent } = await stack.value
    ?.ContentType(_parent._content_type_uid)
    .Entry(_parent.uid)
    .fetch()

  return parent
}

watch(
  () => slugFieldData.value,
  async () => {
    await state.location?.CustomField?.field?.setData(unref(slugFieldData))
  }
)
