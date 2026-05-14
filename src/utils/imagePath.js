// Prefix image paths with Vite's BASE_URL so they work on GitHub Pages
const base = import.meta.env.BASE_URL // '/lizzyplace/' in prod, '/' in dev
export const img = (path) => `${base}${path.replace(/^\//, '')}`
