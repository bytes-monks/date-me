import { useEffect, useRef } from 'react'

const GLYPHS = ['❤️', '💕', '💗', '🩷', '✨', '💛']

/**
 * Drifting hearts/sparkles that rise up the background, spawned on an interval.
 * Faithful port of the design's `spawnHeart` loop.
 */
export default function FloatingHearts() {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    const timers: number[] = []

    function spawnHeart() {
      if (!box) return
      const el = document.createElement('div')
      el.className = 'floaty'
      el.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
      const size = 14 + Math.random() * 22
      el.style.fontSize = size + 'px'
      el.style.left = Math.random() * 100 + 'vw'
      el.style.setProperty('--o', (0.35 + Math.random() * 0.45).toFixed(2))
      el.style.setProperty('--dx', Math.random() * 120 - 60 + 'px')
      el.style.setProperty('--rot', Math.random() * 60 - 30 + 'deg')
      const dur = 12 + Math.random() * 11
      el.style.animationDuration = dur + 's'
      box.appendChild(el)
      timers.push(window.setTimeout(() => el.remove(), dur * 1000 + 200))
    }

    for (let i = 0; i < 9; i++) timers.push(window.setTimeout(spawnHeart, i * 600))
    const interval = window.setInterval(spawnHeart, 1400)

    return () => {
      window.clearInterval(interval)
      timers.forEach((t) => window.clearTimeout(t))
      box.replaceChildren()
    }
  }, [])

  return <div id="hearts" ref={boxRef} />
}
