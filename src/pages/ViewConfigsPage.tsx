/**
 * ViewConfigsPage
 * Manage view configurations
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { useViewConfigs } from '../hooks';
import { Field, ViewConfiguration, ViewConfigFormData } from '../types';
import { Button, Modal, Card, ConfirmDialog } from '../components/common';
import './ViewConfigsPage.css';

export function ViewConfigsPage() {
  const { fields } = useAppContext();
  const { viewConfigs, addViewConfig, updateViewConfig, deleteViewConfig } = useViewConfigs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ViewConfiguration | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<ViewConfiguration | null>(null);

  const handleAddConfig = async (data: ViewConfigFormData) => {
    await addViewConfig(data);
    setIsModalOpen(false);
  };

  const handleEditConfig = (config: ViewConfiguration) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleUpdateConfig = async (data: ViewConfigFormData) => {
    if (editingConfig) {
      await updateViewConfig(editingConfig.id, data);
      setIsModalOpen(false);
      setEditingConfig(null);
    }
  };

  const handleDeleteConfig = (config: ViewConfiguration) => {
    setConfigToDelete(config);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (configToDelete) {
      await deleteViewConfig(configToDelete.id);
      setConfigToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  return (
    <div className="view-configs-page">
      <div className="container">
        <div className="view-configs-page__header">
          <div>
            <h2>Ansichtskonfigurationen</h2>
            <p className="view-configs-page__description">
              Erstelle vorgefertigte Ansichten mit ausgewählten Messfeldern für schnellen Zugriff im Dashboard.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Neue Ansicht
          </Button>
        </div>

        <div className="view-configs-list">
          {viewConfigs.length === 0 ? (
            <Card>
              <p>Noch keine Ansichtskonfigurationen erstellt.</p>
            </Card>
          ) : (
            viewConfigs.map((config) => {
              // Get field names for this config
              const configFields = fields.filter((f) => config.fieldIds.includes(f.id));
              const fieldNames = configFields.map((f) => f.name).join(', ');

              const chartTypeLabel =
                config.chartType === 'bar' ? '📊 Balkendiagramm' :
                config.chartType === 'pie' ? '🥧 Kuchendiagramm' :
                '📈 Liniendiagramm';

              return (
                <Card key={config.id} className="view-config-card">
                  <div className="view-config-card__header">
                    <div className="view-config-card__icon">{config.icon}</div>
                    <div className="view-config-card__info">
                      <h3 className="view-config-card__name">
                        {config.name}
                        {config.isDefault && (
                          <span className="view-config-card__badge">Standard</span>
                        )}
                      </h3>
                      {config.description && (
                        <p className="view-config-card__description">{config.description}</p>
                      )}
                      <p className="view-config-card__fields">
                        {configFields.length} {configFields.length === 1 ? 'Feld' : 'Felder'}
                        {fieldNames && `: ${fieldNames}`}
                      </p>
                      <p className="view-config-card__chart-type">
                        {chartTypeLabel}
                      </p>
                    </div>
                  </div>
                  <div className="view-config-card__actions">
                    <Button size="sm" variant="ghost" onClick={() => handleEditConfig(config)}>
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteConfig(config)}
                    >
                      Löschen
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={editingConfig ? 'Ansicht bearbeiten' : 'Neue Ansicht'}
          size="lg"
        >
          <ViewConfigForm
            fields={fields}
            onSubmit={editingConfig ? handleUpdateConfig : handleAddConfig}
            onCancel={handleModalClose}
            initialData={
              editingConfig
                ? {
                    name: editingConfig.name,
                    description: editingConfig.description,
                    fieldIds: editingConfig.fieldIds,
                    icon: editingConfig.icon,
                    chartType: editingConfig.chartType,
                  }
                : undefined
            }
            submitText={editingConfig ? 'Aktualisieren' : 'Erstellen'}
          />
        </Modal>

        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setConfigToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Ansicht löschen"
          message={`Möchtest du die Ansicht "${configToDelete?.name}" wirklich löschen?`}
          confirmText="Löschen"
          cancelText="Abbrechen"
        />
      </div>
    </div>
  );
}

// ViewConfigForm component
interface ViewConfigFormProps {
  fields: Field[];
  onSubmit: (data: ViewConfigFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ViewConfigFormData>;
  submitText?: string;
}

function ViewConfigForm({
  fields,
  onSubmit,
  onCancel,
  initialData,
  submitText = 'Erstellen',
}: ViewConfigFormProps) {
  const [formData, setFormData] = useState<ViewConfigFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    fieldIds: initialData?.fieldIds || [],
    icon: initialData?.icon || '📊',
    chartType: initialData?.chartType || 'line',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Bitte gib einen Namen ein.');
      return;
    }

    if (formData.fieldIds.length === 0) {
      setError('Bitte wähle mindestens ein Feld aus.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleField = (fieldId: string) => {
    setFormData({
      ...formData,
      fieldIds: formData.fieldIds.includes(fieldId)
        ? formData.fieldIds.filter((id) => id !== fieldId)
        : [...formData.fieldIds, fieldId],
    });
  };

  const availableIcons = ['📊', '🧬', '💪', '🏃', '🍎', '⚖️', '📈', '🎯', '💯', '🔥'];

  return (
    <form className="view-config-form" onSubmit={handleSubmit}>
      <div className="view-config-form__field">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="z.B. Körperzusammensetzung"
          disabled={isSubmitting}
        />
      </div>

      <div className="view-config-form__field">
        <label htmlFor="description">Beschreibung (optional)</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Kurze Beschreibung der Ansicht"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="view-config-form__field">
        <label>Icon</label>
        <div className="icon-selector">
          {availableIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`icon-selector__item ${formData.icon === icon ? 'icon-selector__item--selected' : ''}`}
              onClick={() => setFormData({ ...formData, icon })}
              disabled={isSubmitting}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="view-config-form__field">
        <label>Standard-Diagrammtyp</label>
        <div className="chart-type-selector">
          <label className="chart-type-selector__item">
            <input
              type="radio"
              name="chartType"
              value="line"
              checked={formData.chartType === 'line'}
              onChange={(e) => setFormData({ ...formData, chartType: e.target.value as 'line' | 'bar' | 'pie' })}
              disabled={isSubmitting}
            />
            <span>📈 Liniendiagramm</span>
          </label>
          <label className="chart-type-selector__item">
            <input
              type="radio"
              name="chartType"
              value="bar"
              checked={formData.chartType === 'bar'}
              onChange={(e) => setFormData({ ...formData, chartType: e.target.value as 'line' | 'bar' | 'pie' })}
              disabled={isSubmitting}
            />
            <span>📊 Balkendiagramm</span>
          </label>
          <label className="chart-type-selector__item">
            <input
              type="radio"
              name="chartType"
              value="pie"
              checked={formData.chartType === 'pie'}
              onChange={(e) => setFormData({ ...formData, chartType: e.target.value as 'line' | 'bar' | 'pie' })}
              disabled={isSubmitting}
            />
            <span>🥧 Kuchendiagramm</span>
          </label>
        </div>
      </div>

      <div className="view-config-form__field">
        <label>Messfelder * ({formData.fieldIds.length} ausgewählt)</label>
        <div className="field-selector">
          {fields.length === 0 ? (
            <p>Keine Felder vorhanden. Erstelle zuerst Felder.</p>
          ) : (
            fields.map((field) => (
              <label key={field.id} className="field-selector__item">
                <input
                  type="checkbox"
                  checked={formData.fieldIds.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                  disabled={isSubmitting}
                />
                <span>
                  {field.name} ({field.unit})
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {error && <div className="view-config-form__error">{error}</div>}

      <div className="view-config-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  );
}
