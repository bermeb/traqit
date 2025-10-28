/**
 * EntriesPage
 * Manage measurement entries and fields
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { useEntries, useImages, useFields } from '../hooks';
import { Entry, EntryFormData, Field, FieldFormData, ViewConfiguration } from '../types';
import { Button, Modal, Card, ConfirmDialog, Tabs, Tab } from '../components/common';
import { EntryForm, EntryList } from '../components/entries';
import { FieldForm, FieldList } from '../components/fields';
import { ImageCompareModal } from '../components/compare';
import { getViewConfigsUsingField, updateViewConfig } from '../services/db';
import './EntriesPage.css';

export function EntriesPage() {
  const { fields } = useAppContext();
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries();
  const { addField, updateField, deleteField, reorderFields } = useFields();
  const { uploadImage } = useImages();

  // Tab state
  const [activeTab, setActiveTab] = useState('entries');

  // Entry state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Field state
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldDeleteConfirmOpen, setFieldDeleteConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [affectedConfigs, setAffectedConfigs] = useState<ViewConfiguration[]>([]);

  const handleAddEntry = async (data: EntryFormData) => {
    let imageId: string | undefined;

    // Upload image if present
    if (data.image) {
      imageId = await uploadImage(data.image, 'temp'); // Will be updated with entry ID
    }

    await addEntry(data, imageId);
    setIsModalOpen(false);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleUpdateEntry = async (data: EntryFormData) => {
    if (!editingEntry) return;

    let imageId = editingEntry.imageId;

    // Upload new image if changed
    if (data.image) {
      imageId = await uploadImage(data.image, editingEntry.id);
    }

    await updateEntry(editingEntry.id, {
      date: data.date,
      values: data.values,
      notes: data.notes,
      imageId,
    });

    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  // Field handlers
  const handleAddField = async (data: FieldFormData) => {
    await addField(data);
    setIsFieldModalOpen(false);
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setIsFieldModalOpen(true);
  };

  const handleUpdateField = async (data: FieldFormData) => {
    if (editingField) {
      await updateField(editingField.id, data);
      setIsFieldModalOpen(false);
      setEditingField(null);
    }
  };

  const handleDeleteField = async (id: string) => {
    const configs = await getViewConfigsUsingField(id);
    setAffectedConfigs(configs);
    setFieldToDelete(id);
    setFieldDeleteConfirmOpen(true);
  };

  const confirmFieldDelete = async () => {
    if (!fieldToDelete) return;

    try {
      for (const config of affectedConfigs) {
        const updatedFieldIds = config.fieldIds.filter((id) => id !== fieldToDelete);
        await updateViewConfig(config.id, { fieldIds: updatedFieldIds });
      }

      await deleteField(fieldToDelete);

      setFieldToDelete(null);
      setAffectedConfigs([]);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const handleFieldModalClose = () => {
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleMoveUp = async (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index <= 0) return;

    const newOrder = [...fields];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    await reorderFields(newOrder.map((f) => f.id));
  };

  const handleMoveDown = async (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1 || index >= fields.length - 1) return;

    const newOrder = [...fields];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    await reorderFields(newOrder.map((f) => f.id));
  };

  const hasImagesCount = entries.filter((e) => e.imageId).length;

  // Entries tab content
  const entriesContent = (
    <>
      <div className="entries-page__header">
        <h3>Einträge</h3>
        <div className="entries-page__actions">
          {hasImagesCount >= 2 && (
            <Button
              variant="secondary"
              onClick={() => setIsCompareModalOpen(true)}
            >
              📸 Bilder vergleichen
            </Button>
          )}
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Neuer Eintrag
          </Button>
        </div>
      </div>

      <Card>
        <EntryList
          entries={entries}
          fields={fields}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
        size="lg"
      >
        <EntryForm
          fields={fields}
          onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
          onCancel={handleModalClose}
          initialData={
            editingEntry
              ? {
                  date: editingEntry.date,
                  values: editingEntry.values,
                  notes: editingEntry.notes,
                }
              : undefined
          }
          submitText={editingEntry ? 'Aktualisieren' : 'Speichern'}
        />
      </Modal>

      <ImageCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        entries={entries}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eintrag löschen"
        message="Möchtest du diesen Eintrag wirklich löschen?"
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </>
  );

  // Fields tab content
  const fieldsContent = (
    <>
      <div className="fields-page__header">
        <h3>Messfelder</h3>
        <Button variant="primary" onClick={() => setIsFieldModalOpen(true)}>
          + Neues Feld
        </Button>
      </div>

      <Card>
        <FieldList
          fields={fields}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </Card>

      <Modal
        isOpen={isFieldModalOpen}
        onClose={handleFieldModalClose}
        title={editingField ? 'Feld bearbeiten' : 'Neues Feld'}
      >
        <FieldForm
          onSubmit={editingField ? handleUpdateField : handleAddField}
          onCancel={handleFieldModalClose}
          initialData={
            editingField
              ? {
                  name: editingField.name,
                  unit: editingField.unit,
                  type: editingField.type,
                  goalDirection: editingField.goalDirection || 'increase',
                }
              : undefined
          }
          submitText={editingField ? 'Aktualisieren' : 'Hinzufügen'}
        />
      </Modal>

      <ConfirmDialog
        isOpen={fieldDeleteConfirmOpen}
        onClose={() => {
          setFieldDeleteConfirmOpen(false);
          setAffectedConfigs([]);
          setFieldToDelete(null);
        }}
        onConfirm={confirmFieldDelete}
        title="Feld löschen"
        message={
          affectedConfigs.length > 0
            ? `Möchtest du dieses Feld wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.\n\n⚠️ Dieses Feld wird in folgenden Ansichtskonfigurationen verwendet:\n${affectedConfigs.map((c) => `• ${c.name}`).join('\n')}\n\nDas Feld wird aus diesen Konfigurationen entfernt.`
            : 'Möchtest du dieses Feld wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.'
        }
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </>
  );

  const tabs: Tab[] = [
    {
      id: 'entries',
      label: 'Einträge',
      icon: '📅',
      content: entriesContent,
    },
    {
      id: 'fields',
      label: 'Felder',
      icon: '📝',
      content: fieldsContent,
    },
  ];

  return (
    <div className="entries-page">
      <div className="container">
        <h2>Erfassung</h2>
        <Tabs tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
