import { useEffect, useRef, useState } from 'react'
import FloatingHearts from './components/FloatingHearts'
import Confetti, { type ConfettiHandle } from './components/Confetti'
import EvasiveButton from './components/EvasiveButton'

type ScreenId = 'intro' | 'q1' | 'q2' | 'q3' | 'ask' | 'done-screen'

function Ticks({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div className="ticks">
      {[0, 1, 2].map((i) => (
        <span key={i} className={'tick' + (i === active ? ' on' : '')} />
      ))}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('intro')
  const confettiRef = useRef<ConfettiHandle>(null)

  useEffect(() => {
    if (screen === 'done-screen') {
      document.body.classList.add('celebrate')
      confettiRef.current?.celebrate()
    } else {
      document.body.classList.remove('celebrate')
    }
  }, [screen])

  const cls = (id: ScreenId) => 'screen' + (screen === id ? ' active' : '')

  return (
    <>
      <FloatingHearts />
      <Confetti ref={confettiRef} />

      <div className="stage">
        <div className="note">
          <span className="sticker tl">💌</span>
          <span className="sticker br">✨</span>

          {/* intro */}
          <section className={cls('intro')} id="intro" data-screen-label="Intro">
            <p className="kicker">okay — don't make it weird, but…</p>
            <h1 className="line">
              There's something I've wanted to <span className="mark">say</span> for a while.
            </h1>
            <p className="body">
              I typed it out, deleted it, typed it again. Eventually I gave up and just made you click through it
              instead. Bear with me?
            </p>
            <div className="aside">
              <svg width="34" height="22" viewBox="0 0 34 22">
                <path d="M2 18 C 10 4, 22 4, 30 10" fill="none" stroke="#8a6d72" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M24 10 L 31 9 L 28 16"
                  fill="none"
                  stroke="#8a6d72"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>yeah, I'm a little nervous. tap along?</span>
            </div>
            <div className="choices">
              <button className="btn big" type="button" onClick={() => setScreen('q1')}>
                okay, I'm listening →
              </button>
            </div>
          </section>

          {/* q1 */}
          <section className={cls('q1')} id="q1" data-screen-label="Step 1">
            <Ticks active={0} />
            <p className="kicker">first, an honest one</p>
            <h1 className="line">
              Do you ever catch yourself looking forward to <span className="mark">seeing me</span>?
            </h1>
            <div className="choices">
              <button className="btn" type="button" onClick={() => setScreen('q2')}>
                Honestly… yeah, I do
              </button>
              <button className="btn ghost" type="button" onClick={() => setScreen('q2')}>
                More than I'd admit out loud
              </button>
              <EvasiveButton screenId="q1" activeScreen={screen} label="who, you?" />
            </div>
          </section>

          {/* q2 */}
          <section className={cls('q2')} id="q2" data-screen-label="Step 2">
            <Ticks active={1} />
            <p className="kicker">second one, bear with me</p>
            <h1 className="line">
              Be honest — do you smile a little when my <span className="mark">name</span> shows up on your phone?
            </h1>
            <p className="body">Asking for me. Strictly for me.</p>
            <div className="choices">
              <button className="btn" type="button" onClick={() => setScreen('q3')}>
                Okay… maybe a little
              </button>
              <button className="btn ghost" type="button" onClick={() => setScreen('q3')}>
                Every single time
              </button>
              <EvasiveButton screenId="q2" activeScreen={screen} label="not really" />
            </div>
          </section>

          {/* q3 */}
          <section className={cls('q3')} id="q3" data-screen-label="Step 3">
            <Ticks active={2} />
            <p className="kicker">okay, getting braver now</p>
            <h1 className="line">
              If it were just us — no plans, no phones — would that be <span className="mark">enough</span>?
            </h1>
            <div className="choices">
              <button className="btn" type="button" onClick={() => setScreen('ask')}>
                That sounds kind of perfect
              </button>
              <button className="btn ghost" type="button" onClick={() => setScreen('ask')}>
                I wouldn't want to leave
              </button>
              <EvasiveButton screenId="q3" activeScreen={screen} label="meh" />
            </div>
          </section>

          {/* the ask */}
          <section className={cls('ask')} id="ask" data-screen-label="The Ask">
            <p className="kicker">so — here's the thing I actually came to say:</p>
            <h1 className="line">
              Will you let me take you <span className="mark">out</span>?
            </h1>
            <div className="aside">
              <svg width="30" height="22" viewBox="0 0 30 22">
                <path d="M3 11 C 11 3, 20 3, 27 9" fill="none" stroke="#f0453a" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M21 9 L 28 8 L 25 15"
                  fill="none"
                  stroke="#f0453a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>no pressure… okay, a little pressure. the No button's shy.</span>
            </div>
            <div className="row">
              <button className="btn big" type="button" id="yes" onClick={() => setScreen('done-screen')}>
                Yes! 🥰
              </button>
              <EvasiveButton screenId="ask" activeScreen={screen} label="No" />
            </div>
          </section>

          {/* finale */}
          <section className={cls('done-screen')} id="done-screen" data-screen-label="She said yes">
            <span className="yell">YES!!</span>
            <h1 className="line">
              I was really hoping you'd <span className="mark">say that</span>.
            </h1>
            <p className="body">
              No grand plan, no pressure — just me, you, and somewhere we can talk for hours. I'll sort the rest; you
              just tell me when.
            </p>
            <p className="sign">
              — yours, a little less nervous now, <b>Bachar</b>
            </p>
            <p className="ps">p.s. I really did rewrite this about a hundred times 😌</p>
            <button className="replay" type="button" id="replay" onClick={() => setScreen('intro')}>
              ↺ read it again
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
