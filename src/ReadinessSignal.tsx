import type {TrafficLightSignal} from './domain/report-guidance';

type ReadinessSignalProps = {
  signal: TrafficLightSignal;
};

export default function ReadinessSignal({signal}: ReadinessSignalProps) {
  return (
    <section className={`readiness-signal readiness-signal--${signal.color}`} aria-label="Traffic-light readiness signal">
      <div className={`traffic-light traffic-light--${signal.color}`} aria-hidden="true">
        <span className="traffic-light__bulb traffic-light__bulb--red" />
        <span className="traffic-light__bulb traffic-light__bulb--amber" />
        <span className="traffic-light__bulb traffic-light__bulb--green" />
      </div>
      <div className="readiness-signal__copy">
        <p className="eyebrow">Readiness Signal</p>
        <h3>{signal.label}: {signal.title}</h3>
        <p>{signal.description}</p>
        {signal.rangeNote && <p className="readiness-signal__range-note">{signal.rangeNote}</p>}
        <p className="readiness-signal__caveat">This signal is not approval to deploy AI; confirm safeguards for the specific use case.</p>
      </div>
    </section>
  );
}
