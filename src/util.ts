import _slugify from 'slugify'

export const slugify = (title: string) =>
  _slugify(title, {
    replacement: '-', // replace spaces with replacement character, defaults to `-`
    remove: /[*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    // locale: 'vi',       // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  })
