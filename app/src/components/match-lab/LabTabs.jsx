import { ChartNoAxesCombined, Trophy } from 'lucide-react';
import { Swords } from '../../lib/icons.js';

export function LabTabs({ setTab, tab }) {
  return (
    <div
      className="lab-tabs"
      role="tablist"
      aria-label="Analisi delle performance"
    >
      {[
        ['studio', 'Match studio', Trophy],
        ['forma', 'La mia curva', ChartNoAxesCombined],
        ['duello', 'Testa a testa', Swords],
      ].map(([tabId, tabLabel, icon]) => {
        const Icon = icon;
        return (
          <button
            key={String(tabId)}
            id={`tab-${tabId}`}
            role="tab"
            aria-selected={tab === tabId}
            aria-controls={`panel-${tabId}`}
            tabIndex={tab === tabId ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const tabOrder = ['studio', 'forma', 'duello'];
                const nextTab =
                  tabOrder[
                    (tabOrder.indexOf(tab) +
                      (event.key === 'ArrowRight' ? 1 : 2)) %
                      3
                  ];
                setTab(nextTab);
                document.getElementById(`tab-${nextTab}`)?.focus();
              }
            }}
            onClick={() => setTab(String(tabId))}
          >
            <Icon size={19} />
            {String(tabLabel)}
          </button>
        );
      })}
    </div>
  );
}
