import { useEffect, useRef } from 'react'

export function useReveal() {
  const refs = useRef([])
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    refs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])
  const addRef = (el) => { if (el && !refs.current.includes(el)) refs.current.push(el) }
  return addRef
}
