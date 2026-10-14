import { useRef } from 'react';

/**
 * Tab accessibili (tablist con roving tabindex): frecce, Home e End spostano
 * la selezione e il focus. `idPrefix` genera id `tab-<prefix>-<id>`.
 */
export function Tabs({ label, idPrefix, panelId, tabs, value, onChange }) {
  const listRef = useRef(null);
  const move = (event, index) => {
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };
  return (
    <div className="pg-tabs" role="tablist" aria-label={label} ref={listRef}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${idPrefix}-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={panelId}
          tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => move(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
