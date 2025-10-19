/**
 * EntriesPage
 * Manage measurement entries
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { useEntries, useImages } from '../hooks';
import { Entry, EntryFormData } from '../types';
import { Button, Modal, Card, ConfirmDialog } from '../components/common';
import { EntryForm, EntryList } from '../components/entries';
import { ImageCompareModal } from '../components/compare';
import './EntriesPage.css';

export function EntriesPage() {
  const { fields } = useAppContext();
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries();
  const { uploadImage } = useImages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

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

  const hasImagesCount = entries.filter((e) => e.imageId).length;

  return (
    <div className="entries-page">
      <div className="container">
        <div className="entries-page__header">
          <h2>Einträge</h2>
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
      </div>
    </div>
  );
}
