import {useEffect, type CSSProperties} from 'react';

const colors = ['#183651', '#417db1', '#5d97aa', '#8ba8cb', '#aab9ce', '#426d79'];
const particles = Array.from({length: 84}, (_, index) => {
  const side = index % 2 === 0 ? 1 : -1;
  const spread = 5 + (index * 29) % 47;
  return {
    left: side === 1 ? '3%' : '97%',
    backgroundColor: colors[index % colors.length],
    width: (7 + index % 6) + 'px',
    height: (10 + index % 9) + 'px',
    borderRadius: index % 4 === 0 ? '50%' : '2px',
    '--arc-x': side * spread * 0.64 + 'vw',
    '--arc-y': -(12 + (index * 7) % 29) + 'vh',
    '--end-x': side * spread + 'vw',
    '--end-y': (17 + (index * 11) % 35) + 'vh',
    '--turn': side * (125 + index * 13) + 'deg',
    animationDelay: ((index % 7) * 42) + 'ms',
    animationDuration: (1600 + (index % 8) * 105) + 'ms',
  } as CSSProperties;
});

export default function CompletionConfetti({onFinish}: {onFinish: () => void}) {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 2700);
    return () => window.clearTimeout(timer);
  }, [onFinish]);
  return <div className="completion-confetti" aria-hidden="true">
    {particles.map((style, index) => <i key={index} style={style} />)}
  </div>;
}
