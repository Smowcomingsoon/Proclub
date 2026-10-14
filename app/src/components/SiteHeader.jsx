import { SectionNav } from './SectionNav.jsx';

export function SiteHeader({ connection }) {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <img
          className="site-logo"
          src="/logo-billocchi.svg"
          alt="Stemma BILLOCCHI CLUB"
        />
        <span>
          {'BILLOCCHI '}
          <b>CLUB</b>
          <small>FC 27 / CLUB INTELLIGENCE</small>
        </span>
      </a>
      <SectionNav />
      <div className="status">
        <i className={connection === 'yes' ? 'active' : ''} />
        {connection === 'yes'
          ? 'EA collegata'
          : connection === 'partial'
            ? 'EA parziale'
            : connection === 'no'
              ? 'Ultimi dati salvati'
              : 'Connessione a EA'}
      </div>
    </header>
  );
}
