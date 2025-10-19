/**
 * HomePage
 * Dashboard with overview statistics
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { Card, Button } from '../components/common';
import { StatGrid } from '../components/statistics';
import { RecentEntries } from '../components/dashboard';
import { useViewConfigs } from '../hooks';
import { formatDate } from '../utils';
import './HomePage.css';

export function HomePage() {
  const { fields, entries, setCurrentRoute } = useAppContext();
  const { viewConfigs } = useViewConfigs();
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  // Calculate dashboard statistics
  const entriesWithImages = entries.filter((e) => e.imageId).length;
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const lastEntryDate = sortedEntries[0]?.date;
  const firstEntryDate = sortedEntries[sortedEntries.length - 1]?.date;

  // Calculate tracking duration
  const trackingDays = firstEntryDate
    ? Math.floor((new Date().getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const stats = [
    { label: 'Messfelder', value: fields.length, icon: '📝', color: 'primary' },
    { label: 'Einträge gesamt', value: entries.length, icon: '📅', color: 'secondary' },
    { label: 'Mit Bildern', value: entriesWithImages, icon: '📸', color: 'accent' },
    {
      label: 'Letzter Eintrag',
      value: lastEntryDate ? formatDate(lastEntryDate, 'dd.MM.yy') : '—',
      icon: '🕐',
      color: 'success',
      small: true
    },
  ];

  const hasData = fields.length > 0 && entries.length > 0;

  // Get selected configuration or default to showing all fields
  const selectedConfig = selectedConfigId
    ? viewConfigs.find((c) => c.id === selectedConfigId)
    : null;

  // Filter fields based on selected configuration
  const displayFields = selectedConfig
    ? fields.filter((f) => selectedConfig.fieldIds.includes(f.id))
    : fields;

  // Check if fields from config still exist (handle deleted fields)
  const configHasValidFields = selectedConfig
    ? selectedConfig.fieldIds.some((id) => fields.find((f) => f.id === id))
    : true;

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-page__header">
          <div>
            <h2 className="home-page__title">Dashboard</h2>
            {trackingDays > 0 && (
              <p className="home-page__subtitle">
                📊 Tracking seit {trackingDays} {trackingDays === 1 ? 'Tag' : 'Tagen'}
              </p>
            )}
          </div>
        </div>

        <div className="home-page__stats">
          {stats.map((stat) => (
            <Card key={stat.label} className={`stat-card stat-card--${stat.color}`}>
              <div className="stat-card__icon">{stat.icon}</div>
              <div className={`stat-card__value ${stat.small ? 'stat-card__value--small' : ''}`}>
                {stat.value}
              </div>
              <div className="stat-card__label">{stat.label}</div>
            </Card>
          ))}
        </div>

        {hasData ? (
          <>
            {viewConfigs.length > 0 && (
              <div className="home-page__view-configs">
                <h3 className="home-page__section-title">Ansichten</h3>
                <div className="view-config-selector">
                  <Button
                    variant={!selectedConfigId ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedConfigId(null)}
                  >
                    📊 Alle Felder
                  </Button>
                  {viewConfigs.map((config) => (
                    <Button
                      key={config.id}
                      variant={selectedConfigId === config.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedConfigId(config.id)}
                    >
                      {config.icon} {config.name}
                    </Button>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentRoute('/view-configs')}
                  >
                    ⚙️ Verwalten
                  </Button>
                </div>
              </div>
            )}

            <div className="home-page__content">
              <div className="home-page__section">
                <h3 className="home-page__section-title">
                  {selectedConfig ? `${selectedConfig.icon} ${selectedConfig.name}` : 'Statistiken'}
                </h3>
                {selectedConfig?.description && (
                  <p className="home-page__section-description">{selectedConfig.description}</p>
                )}
                {configHasValidFields ? (
                  <StatGrid entries={entries} fields={displayFields} />
                ) : (
                  <Card>
                    <p>Keine gültigen Felder in dieser Konfiguration vorhanden.</p>
                  </Card>
                )}
              </div>

              {entries.length > 0 && (
                <div className="home-page__section">
                  <h3 className="home-page__section-title">Letzte Einträge</h3>
                  <RecentEntries entries={sortedEntries.slice(0, 5)} fields={fields} />
                </div>
              )}
            </div>
          </>
        ) : (
          <Card className="home-page__welcome">
            <h3>Willkommen bei TraqIt</h3>
            <p>Beginne mit dem Tracking deiner Körperdaten:</p>
            <ol>
              <li>Erstelle Messfelder unter <a href="#/fields">Felder</a></li>
              <li>Füge Einträge unter <a href="#/entries">Einträge</a> hinzu</li>
              <li>Visualisiere deine Fortschritte unter <a href="#/charts">Diagramme</a></li>
              <li>Sichere deine Daten unter <a href="#/backup">Backup</a></li>
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}
