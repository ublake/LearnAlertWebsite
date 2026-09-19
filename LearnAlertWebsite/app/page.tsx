'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

type Stage = 'intro' | 'opening' | 'open';

function NotificationDemo() {
  const [paused, setPaused] = useState(false);
  return <div className={`notification-demo${paused ? ' is-paused' : ''}`}>
    <div className="demo-scene" role="img" aria-label="LearnAlert demo: a floating notification opens into a quiz asking which planet has the most prominent rings. Saturn is selected correctly, then the notification disappears and repeats.">
      <div className="demo-halo" aria-hidden="true" />
      <div className="demo-shadow" aria-hidden="true" />
      <div className="demo-flight" aria-hidden="true">
        <div className="demo-glass">
          <div className="demo-header">
            <img src="/LearnAlertLogo.png" alt="" width="38" height="38" />
            <span>LearnAlert<span className="demo-deck">A little astronomy</span></span>
            <span className="demo-time">now</span>
          </div>
          <div className="demo-summary"><div><strong>A little space for learning.</strong><p>Your next question is ready.</p></div></div>
          <div className="demo-expansion"><div className="demo-quiz">
            <p className="demo-question">Which planet is known for<br />its spectacular rings?</p>
            <div className="demo-answers">
              <div className="demo-answer"><span className="demo-letter">A</span>Jupiter<span className="demo-radio" /></div>
              <div className="demo-answer is-correct"><span className="demo-letter">B</span>Saturn<span className="demo-radio"><svg viewBox="0 0 20 20"><path d="m5 10 3.2 3.2L15 6.5" /></svg></span><span className="demo-tap" /></div>
              <div className="demo-answer"><span className="demo-letter">C</span>Neptune<span className="demo-radio" /></div>
            </div>
            <div className="demo-result"><span className="demo-thinking">A small question. A little progress.</span><span className="demo-success">Correct. See you at the next one.</span></div>
          </div></div>
          <div className="demo-grabber" />
        </div>
      </div>
    </div>
    <button className="demo-pause" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play notification animation' : 'Pause notification animation'} aria-pressed={paused}>
      {paused ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" /></svg>}
    </button>
  </div>;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('intro');
  const [origin, setOrigin] = useState<CSSProperties>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const notification = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    document.body.style.overflow = stage === 'open' ? '' : 'hidden';
    if (stage === 'open') heading.current?.focus({preventScroll:true});
    return () => { document.body.style.overflow = ''; };
  }, [stage]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function open() {
    if (stage !== 'intro') return;
    const rect = notification.current?.getBoundingClientRect();
    if (rect) setOrigin({'--origin-x':`${rect.left}px`,'--origin-y':`${rect.top}px`,'--origin-w':`${rect.width}px`,'--origin-h':`${rect.height}px`} as CSSProperties);
    setStage('opening');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current = setTimeout(() => {setStage('open');}, reduced ? 0 : 1250);
  }
  return <>
    {stage !== 'open' && <div className={`intro ${stage === 'opening' ? 'is-opening' : ''}`}>
      <div className="notification-wrap">
        <button ref={notification} className="notification" onClick={open} disabled={stage === 'opening'} aria-label="Open LearnAlert website">
          <img src="/LearnAlertLogo.png" alt="" width="52" height="52" />
          <span className="notification-copy"><span className="notification-top"><strong>LearnAlert</strong><span>now</span></span><strong>Time for a little learning.</strong><span>Your next flashcard is ready. Hold to view.</span></span>
        </button>
        <div className="click-cue" aria-hidden="true"><svg viewBox="0 0 95 85"><path pathLength="1" d="M83 75C44 77 34 40 34 12"/><path className="arrow-tip" pathLength="1" d="M20 26L34 11L48 27" /></svg><span>{Array.from('click to open').map((letter,i)=><span key={i} style={{'--letter':i} as CSSProperties}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span></div>
      </div>
    </div>}
    {stage === 'opening' && <div className="glass-expansion" style={origin} aria-hidden="true"/>}
    <div className={`website ${stage !== 'intro' ? 'is-open' : ''}`} inert={stage !== 'open'} aria-hidden={stage !== 'open'}>
      <header className="nav">
        <a className="brand" href="#"><img src="/LearnAlertLogo.png" alt="" width="34" height="34" />LearnAlert</a>
        <ThemeToggle />
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow"><span /> LEARNING, A LITTLE AT A TIME</p><h1 ref={heading} tabIndex={-1}>Study Right From<br/>Your <span>Notifications</span></h1><p className="hero-description">Pick a deck. Set a schedule. Study right from your notifications, without opening the app.</p><div className="store-badge" id="download"><img src="/app-store-badge.svg" alt="Download on the App Store" width="180" height="60" /></div><p className="platform-note">For iPhone · Launching soon</p></div>
          {stage === 'open' && <NotificationDemo />}
        </section>
      </main>
      <footer><span>LearnAlert</span><span className="footer-links"><a className="footer-link" href="/support">Support</a><a className="footer-link" href="/privacy-policy">Privacy Policy</a><a className="footer-link" href="/terms">Terms &amp; Conditions</a></span></footer>
    </div>
  </>;
}
