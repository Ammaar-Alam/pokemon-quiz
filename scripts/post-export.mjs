import { writeFile } from 'node:fs/promises'

try {
  await writeFile('out/.nojekyll', '')
  console.log('Added out/.nojekyll for GitHub Pages')
} catch (e) {
  console.warn('postbuild step: could not create out/.nojekyll', e?.message)
}

