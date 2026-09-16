'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Stage = 'intro' | 'opening' | 'open';
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
      <header className="nav"><a className="brand" href="#"><img src="/LearnAlertLogo.png" alt="" width="34" height="34" />LearnAlert</a></header>
      <main>
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow"><span /> LEARNING, A LITTLE AT A TIME</p><h1 ref={heading} tabIndex={-1}>Your day.<br/>A little <span>smarter.</span></h1><p className="hero-description">Pick a deck. Set a schedule. Study right from your notifications, without opening the app.</p><div className="store-badge" id="download"><img src="/app-store-badge.svg" alt="Download on the App Store" width="180" height="60" /></div><p className="platform-note">For iPhone · Launching soon</p></div>
          <div className="app-preview" aria-label="A look inside LearnAlert">
            <figure className="preview-side"><img src="/example1.png" alt="Discover ready-made flashcard decks" width="1206" height="2622"/><figcaption>Discover</figcaption></figure>
            <figure className="preview-main"><img src="/example2.png" alt="LearnAlert decks and notification schedule" width="1206" height="2622"/><figcaption>Your rhythm.</figcaption></figure>
            <figure className="preview-side"><img src="/example3.png" alt="Review the flashcards in your deck" width="1206" height="2622"/><figcaption>Study</figcaption></figure>
          </div>
        </section>
        <section className="steps" aria-label="How LearnAlert works"><article><span>01</span><div><h2>Create your deck.</h2><p>Your own cards or a ready-made set.</p></div></article><article><span>02</span><div><h2>Set your schedule.</h2><p>Every hour? Find your rhythm.</p></div></article><article><span>03</span><div><h2>Hold. Answer. Carry on.</h2><p>A little learning, right in the notification.</p></div></article></section>
      </main>
      <footer><span>LearnAlert</span></footer>
    </div>
  </>;
}
