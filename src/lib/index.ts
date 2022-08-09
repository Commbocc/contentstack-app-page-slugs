import { computed, reactive, ref } from 'vue'
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

export function updateChildrenOfEntryIfUrlHasChanged(_entry: Entry) {
  if (initialUrl.value === _entry.url) return
  updateChildrenOfEntry(_entry)
}

export async function updateChildrenOfEntry(_entry: Entry) {
  if (!isNewEntry.value) {
    const children = await getChildren(_entry)

    for (const child of children) {
      const { url, slug } = await generateSlugAndUrl(child, _entry)

      const { entry: updatedChild } = await stack.value
        ?.ContentType('page')
        .Entry(child.uid)
        .update({
          entry: {
            slug,
            url,
          },
        })

      await updateChildrenOfEntry(updatedChild)
    }
  }
}

export const getParent = async (entry: Entry): Promise<Entry | null> => {
  const [_parent] = entry.parent?.page || []
  if (!_parent) return null

  const { entry: parent } = await stack.value
    ?.ContentType(_parent._content_type_uid)
    .Entry(_parent.uid)
    .fetch()

  return parent
}

export const getChildren = async (entry: Entry): Promise<Entry[]> => {
  const { entries } = await stack.value
    ?.ContentType('page')
    .Entry.Query()
    .where('parent.page.uid', entry.uid)
    .find()
  return entries || []
}
