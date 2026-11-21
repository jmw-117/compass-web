import type {CSSProperties} from 'react';

const colors = ['#ac813a', '#688eb1', '#b8c2ce', '#54798b'];

export default function CompletionConfetti({onFinish}: {onFinish: () => void}) {
  return (
    <div className="completion-confetti" aria-hidden="true"
      onAnimationEnd={(event) => {if (event.target === event.currentTarget) onFinish();}}>
      {Array.from({length: 22}, (_, index) => (
        <i key={index} style={{
          left: `${8 + (index * 37) % 84}%`,
          backgroundColor: colors[index % colors.length],
          '--drift': `${((index * 13) % 61) - 30}px`,
          '--drop': `${50 + (index * 17) % 70}px`,
          '--spin': `${(index % 2 ? -1 : 1) * (90 + index * 17)}deg`,
          animationDelay: `${(index % 6) * 25}ms`,
        } as CSSProperties} />
      ))}
    </div>
  );
}
