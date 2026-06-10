import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface ConfettiHandle {
  celebrate: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  size: number
  rot: number
  vr: number
  color: string
  heart: boolean
  life: number
}

const WARM = ['#ff6b5e', '#ff8fab', '#ffcf4d', '#f0453a', '#ffffff', '#7ed6b8']

function heartPath(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath()
  c.moveTo(x, y + s * 0.3)
  c.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3)
  c.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s)
  c.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3)
  c.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3)
  c.closePath()
  c.fill()
}

/**
 * Warm confetti + hearts explosion on a full-screen canvas.
 * Call `celebrate()` (via ref) to fire the burst sequence.
 */
const Confetti = forwardRef<ConfettiHandle>(function Confetti(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const partsRef = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    celebrate() {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resize()

      const burst = (n: number) => {
        const cx = canvas.width / 2
        const cy = canvas.height * 0.4
        for (let i = 0; i < n; i++) {
          const ang = Math.random() * Math.PI * 2
          const spd = 3 + Math.random() * 11
          partsRef.current.push({
            x: cx + (Math.random() * 60 - 30),
            y: cy + (Math.random() * 40 - 20),
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 3,
            g: 0.16 + Math.random() * 0.1,
            size: 7 + Math.random() * 11,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.28,
            color: WARM[(Math.random() * WARM.length) | 0],
            heart: Math.random() < 0.5,
            life: 1,
          })
        }
      }

      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        partsRef.current.forEach((p) => {
          p.vy += p.g
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.99
          p.rot += p.vr
          p.life -= 0.006
          ctx.save()
          ctx.globalAlpha = Math.max(p.life, 0)
          ctx.fillStyle = p.color
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          if (p.heart) heartPath(ctx, 0, -p.size / 2, p.size)
          else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        })
        partsRef.current = partsRef.current.filter((p) => p.life > 0 && p.y < canvas.height + 60)
        if (partsRef.current.length) {
          rafRef.current = requestAnimationFrame(loop)
        } else if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      burst(130)
      window.setTimeout(() => burst(80), 260)
      window.setTimeout(() => burst(60), 560)
      if (rafRef.current == null) loop()
    },
  }))

  // keep the canvas sized to the viewport
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas id="confetti" ref={canvasRef} />
})

export default Confetti
