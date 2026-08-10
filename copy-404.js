import fs from 'fs'
import path from 'path'

const source = path.resolve('dist/index.html')
const destination = path.resolve('dist/404.html')

try {
  fs.copyFileSync(source, destination)
  console.log('Successfully copied index.html to 404.html for GitHub Pages routing')
} catch (err) {
  console.error('Failed to copy index.html to 404.html:', err)
  process.exit(1)
}
