interface Entry {
  uid?: string
  title: string
  url: string
  slug: string
  parent?: {
    page?: {
      uid: string
      _content_type_uid: string
    }[]
  }
}
