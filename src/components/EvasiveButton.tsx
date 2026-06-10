import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type FocusEvent as ReactFocusEvent,
} from 'react'
import { createPortal } from 'react-dom'

// Grace window after a screen appears, during which the button ignores
// hover/proximity so it never darts out from under the cursor the instant
// you advance to the next step.
const SETTLE_MS = 700
const TRANSITION = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease'

interface Pos {
  tx: number
  ty: number
  rot: number
}

interface EvasiveButtonProps {
  /** id of the screen this button belongs to */
  screenId: string
  /** id of the currently active screen */
  activeScreen: string
  /** the (static) button label */
  label: string
  className?: string
}

/**
 * The un-catchable "No"/bad answer. It slips away from the cursor on hover,
 * proximity, and any press attempt — bouncing off the screen edges, always
 * full-size and visible. While fleeing it portals into <body> so it floats
 * above the (transformed) card instead of being clipped by it.
 */
export default function EvasiveButton({ screenId, activeScreen, label, className }: EvasiveButtonProps) {
  const inlineRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLButtonElement>(null)

  const [detached, setDetached] = useState(false)
  const [pos, setPos] = useState<Pos>({ tx: 0, ty: 0, rot: 0 })

  // mutable mirrors so the imperative handlers always read fresh values
  const detachedRef = useRef(false)
  const posRef = useRef<Pos>({ tx: 0, ty: 0, rot: 0 })
  const baseRef = useRef({ left: 0, top: 0, width: 0, height: 0 })
  const armedAtRef = useRef(0)
  const lastMoveRef = useRef(0)

  const isActive = activeScreen === screenId

  const armed = () => performance.now() >= armedAtRef.current

  // Compute and apply the next dodge position, away from (px, py).
  const moveAway = useCallback((px: number, py: number) => {
    const base = baseRef.current
    const w = base.width
    const h = base.height
    const step = 150
    const pad = 12
    const curLeft = base.left + posRef.current.tx
    const curTop = base.top + posRef.current.ty
    const cx = curLeft + w / 2
    const cy = curTop + h / 2

    let dx = cx - px
    let dy = cy - py
    const d = Math.hypot(dx, dy) || 1
    dx /= d
    dy /= d
    if (curLeft + dx * step < pad || curLeft + dx * step > window.innerWidth - w - pad) dx = -dx
    if (curTop + dy * step < pad || curTop + dy * step > window.innerHeight - h - pad) dy = -dy
    const nx = Math.max(pad, Math.min(curLeft + dx * step, window.innerWidth - w - pad))
    const ny = Math.max(pad, Math.min(curTop + dy * step, window.innerHeight - h - pad))

    const next: Pos = { tx: nx - base.left, ty: ny - base.top, rot: Math.random() * 20 - 10 }
    posRef.current = next
    setPos(next)
  }, [])

  // Trigger a flee from a pointer position (falls back to a jitter near the button).
  const flee = useCallback(
    (clientX?: number, clientY?: number) => {
      if (!detachedRef.current) {
        const el = inlineRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        baseRef.current = { left: r.left, top: r.top, width: r.width, height: r.height }
        posRef.current = { tx: 0, ty: 0, rot: 0 }
        detachedRef.current = true
        setDetached(true)
        setPos({ tx: 0, ty: 0, rot: 0 })
        // Mount at rest first, then dodge on the next frame so the move animates.
        const px = clientX ?? r.left + r.width / 2 + (Math.random() - 0.5) * 50
        const py = clientY ?? r.top + r.height / 2 + (Math.random() - 0.5) * 50
        requestAnimationFrame(() => moveAway(px, py))
      } else {
        const base = baseRef.current
        const cx = base.left + posRef.current.tx + base.width / 2
        const cy = base.top + posRef.current.ty + base.height / 2
        const px = clientX ?? cx + (Math.random() - 0.5) * 50
        const py = clientY ?? cy + (Math.random() - 0.5) * 50
        moveAway(px, py)
      }
    },
    [moveAway],
  )

  // Reset to inline when the screen leaves; arm the settle window when it enters.
  useEffect(() => {
    if (isActive) {
      armedAtRef.current = performance.now() + SETTLE_MS
    } else {
      armedAtRef.current = 0
      lastMoveRef.current = 0
      if (detachedRef.current) {
        detachedRef.current = false
        setDetached(false)
        posRef.current = { tx: 0, ty: 0, rot: 0 }
        setPos({ tx: 0, ty: 0, rot: 0 })
      }
    }
  }, [isActive])

  // Proximity flee — glide away before the cursor arrives (only while active & armed).
  useEffect(() => {
    if (!isActive) return
    const onMove = (e: MouseEvent) => {
      if (!armed()) return
      const now = performance.now()
      if (now - lastMoveRef.current < 240) return
      const el = detachedRef.current ? portalRef.current : inlineRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < 100) {
        lastMoveRef.current = now
        flee(e.clientX, e.clientY)
      }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [isActive, flee])

  // Hover-type triggers only flee once the settle window has passed.
  const onHover = (e: ReactPointerEvent | ReactMouseEvent | ReactFocusEvent) => {
    if (!armed()) return
    e.preventDefault()
    e.stopPropagation()
    const me = e as ReactPointerEvent
    flee(me.clientX, me.clientY)
  }
  // Actual press/click attempts ALWAYS flee — you can never catch it.
  const onPress = (e: ReactPointerEvent | ReactMouseEvent | ReactTouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const me = e as ReactPointerEvent
    const cx = typeof me.clientX === 'number' ? me.clientX : undefined
    const cy = typeof me.clientY === 'number' ? me.clientY : undefined
    flee(cx, cy)
  }

  const handlers = {
    onMouseEnter: onHover,
    onPointerEnter: onHover,
    onFocus: onHover,
    onPointerDown: onPress,
    onMouseDown: onPress,
    onTouchStart: onPress,
    onClick: onPress,
  }

  const btnClass = ['btn', 'bad', className].filter(Boolean).join(' ')

  if (detached) {
    const style: CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      margin: 0,
      left: baseRef.current.left,
      top: baseRef.current.top,
      width: baseRef.current.width,
      transform: `translate(${pos.tx.toFixed(1)}px, ${pos.ty.toFixed(1)}px) rotate(${pos.rot.toFixed(1)}deg)`,
      transition: TRANSITION,
      willChange: 'transform',
    }
    return createPortal(
      <button ref={portalRef} type="button" className={btnClass} tabIndex={-1} style={style} {...handlers}>
        {label}
      </button>,
      document.body,
    )
  }

  return (
    <button
      ref={inlineRef}
      type="button"
      className={btnClass}
      tabIndex={-1}
      style={{ transition: TRANSITION, willChange: 'transform' }}
      {...handlers}
    >
      {label}
    </button>
  )
}
