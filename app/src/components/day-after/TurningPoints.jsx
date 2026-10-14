import { MatchStrip } from './MatchStrip.jsx';

export function TurningPoints({ turningPoints }) {
  return (
    <section className="paper-turning" id="svolte">
      <div className="paper-section-heading">
        <span>01 / LE SVOLTE DELLA NOTTE</span>
        <h3>Le partite lasciano il segno.</h3>
      </div>
      <div className="paper-turning-grid">
        {turningPoints.map((turningPoint, index) => (
          <article key={turningPoint.tag}>
            <span className="paper-story-no">0{index + 1}</span>
            <span className="paper-eyebrow">{turningPoint.tag}</span>
            <h4>{turningPoint.title}</h4>
            <p>{turningPoint.text}</p>
            <details>
              <summary>Le partite che lo raccontano</summary>
              <MatchStrip matches={turningPoint.games} />
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
