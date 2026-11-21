import type {TrafficLightSignal} from './domain/report-guidance';

const lightColors = ['red', 'amber', 'green'] as const;

type ReadinessSignalProps = {
  signal: TrafficLightSignal;
};

export default function ReadinessSignal({signal}: ReadinessSignalProps) {
  return (
    <section className={`readiness-signal readiness-signal--${signal.color}`} aria-label="Traffic-light readiness signal">
      <div className="traffic-light" aria-hidden="true">
        {lightColors.map((color) => (
          <span
            key={color}
            className={`traffic-light__bulb traffic-light__bulb--${color}`}
            data-active={color === signal.color ? '' : undefined}
          />
        ))}
      </div>
      <div className="readiness-signal__copy">
        <p className="eyebrow">Organisational Readiness</p>
        <h3>{signal.label}: {signal.title}</h3>
        <p>{signal.description}</p>
        {signal.rangeNote && <p className="readiness-signal__range-note">{signal.rangeNote}</p>}
        <p className="readiness-signal__caveat">This signal is not approval to deploy AI; confirm safeguards for the specific use case.</p>
      </div>
    </section>
  );
}
