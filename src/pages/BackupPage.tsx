/**
 * BackupPage
 * Export and import data
 */

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context';
import { Button, Card, Modal, ModalActions, ErrorDialog } from '../components/common';
import { exportAsZip, exportCSV } from '../services/export';
import { importFromZip } from '../services/import';
import { getDBStats } from '../services/db';
import { ImportMode } from '../types';
import './BackupPage.css';

export function BackupPage() {
  const { refreshFields, refreshEntries } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [stats, setStats] = useState({ fieldsCount: 0, entriesCount: 0, imagesCount: 0 });
  const [importModeDialogOpen, setImportModeDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stats on mount
  useEffect(() => {
    getDBStats().then(setStats);
  }, []);

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportAsZip();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Export fehlgeschlagen');
      setErrorDialogOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportCSV();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Export fehlgeschlagen');
      setErrorDialogOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file and show mode selection dialog
    setSelectedFile(file);
    setImportModeDialogOpen(true);
  };

  const handleImportWithMode = async (mode: ImportMode) => {
    if (!selectedFile) return;

    setImportModeDialogOpen(false);
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importFromZip(selectedFile, mode);

      if (result.success) {
        setImportResult(
          `${result.message}\n\nFelder: ${result.fieldsImported}\nEinträge: ${result.entriesImported}\nBilder: ${result.imagesImported}`
        );
        await refreshFields();
        await refreshEntries();
        const newStats = await getDBStats();
        setStats(newStats);
      } else {
        setImportResult(`Fehler: ${result.message}`);
      }
    } catch (err) {
      setImportResult(
        `Fehler: ${err instanceof Error ? err.message : 'Import fehlgeschlagen'}`
      );
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="backup-page">
      <div className="container">
        <h2>Backup & Export</h2>

        <Card className="backup-page__card">
          <h3>Aktuelle Daten</h3>
          <div className="backup-page__stats">
            <div className="backup-page__stat">
              <span className="backup-page__stat-value">{stats.fieldsCount}</span>
              <span className="backup-page__stat-label">Felder</span>
            </div>
            <div className="backup-page__stat">
              <span className="backup-page__stat-value">{stats.entriesCount}</span>
              <span className="backup-page__stat-label">Einträge</span>
            </div>
            <div className="backup-page__stat">
              <span className="backup-page__stat-value">{stats.imagesCount}</span>
              <span className="backup-page__stat-label">Bilder</span>
            </div>
          </div>
        </Card>

        <Card className="backup-page__card">
          <h3>Export</h3>
          <p>Sichere deine Daten lokal als ZIP-Datei (inkl. Bilder) oder als CSV.</p>
          <div className="backup-page__actions">
            <Button
              variant="primary"
              onClick={handleExportZip}
              loading={isExporting}
              disabled={stats.entriesCount === 0}
            >
              📦 Als ZIP exportieren
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              loading={isExporting}
              disabled={stats.entriesCount === 0}
            >
              📄 Als CSV exportieren
            </Button>
          </div>
        </Card>

        <Card className="backup-page__card">
          <h3>Import</h3>
          <p>Importiere eine zuvor exportierte ZIP-Datei.</p>
          <div className="backup-page__actions">
            <Button variant="primary" onClick={handleImportClick} loading={isImporting}>
              📥 ZIP importieren
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          {importResult && (
            <div className="backup-page__result">
              <pre>{importResult}</pre>
            </div>
          )}
        </Card>

        <Card className="backup-page__info">
          <h3>ℹ️ Datenschutz</h3>
          <p>
            <strong>Alle Daten bleiben auf deinem Gerät.</strong>
          </p>
          <ul>
            <li>Keine Cloud-Synchronisation</li>
            <li>Keine Server-Übertragung</li>
            <li>100% lokale Speicherung</li>
            <li>Du behältst die volle Kontrolle</li>
          </ul>
        </Card>

        <Modal
          isOpen={importModeDialogOpen}
          onClose={() => {
            setImportModeDialogOpen(false);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          title="Import-Modus wählen"
          size="sm"
        >
          <p style={{ marginBottom: 'var(--spacing-lg)' }}>
            Wie möchtest du die importierten Daten behandeln?
          </p>
          <ModalActions>
            <Button variant="secondary" onClick={() => handleImportWithMode('merge')}>
              Zusammenführen
            </Button>
            <Button variant="primary" onClick={() => handleImportWithMode('overwrite')}>
              Überschreiben
            </Button>
          </ModalActions>
        </Modal>

        <ErrorDialog
          isOpen={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          title="Export fehlgeschlagen"
          message={errorMessage}
        />
      </div>
    </div>
  );
}
