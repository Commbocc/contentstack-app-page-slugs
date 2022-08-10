import { reactive } from 'vue'
import { stack } from '../lib'

export const useChildren = () => {
  const children = reactive<{
    loading: boolean
    data: Entry[]
  }>({
    loading: true,
    data: [],
  })

  async function fetchChildrenOf(entry: Entry) {
    children.loading = true
    try {
      const { entries } = await stack.value
        ?.ContentType('page')
        .Entry.Query()
        .where('parent.page.uid', entry.uid)
        .ascending('title')
        .find()

      children.data = entries || []
    } catch (error) {
      console.warn('Error loading children', error)
    } finally {
      children.loading = false
    }
  }

  return { fetchChildrenOf, children }
}
