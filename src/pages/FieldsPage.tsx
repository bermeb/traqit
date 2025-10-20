/**
 * FieldsPage
 * Manage measurement fields
 */

import { useState } from 'react';
import { useFields } from '../hooks';
import { Field, FieldFormData, ViewConfiguration } from '../types';
import { Button, Modal, Card, ConfirmDialog } from '../components/common';
import { FieldForm, FieldList } from '../components/fields';
import { getViewConfigsUsingField, updateViewConfig } from '../services/db';
import './FieldsPage.css';

export function FieldsPage() {
  const { fields, addField, updateField, deleteField, reorderFields } = useFields();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [affectedConfigs, setAffectedConfigs] = useState<ViewConfiguration[]>([]);

  const handleAddField = async (data: FieldFormData) => {
    await addField(data);
    setIsModalOpen(false);
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  const handleUpdateField = async (data: FieldFormData) => {
    if (editingField) {
      await updateField(editingField.id, data);
      setIsModalOpen(false);
      setEditingField(null);
    }
  };

  const handleDeleteField = async (id: string) => {
    // Check if field is used in any view configurations
    const configs = await getViewConfigsUsingField(id);
    setAffectedConfigs(configs);
    setFieldToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!fieldToDelete) return;

    try {
      // Remove field from all affected view configurations
      for (const config of affectedConfigs) {
        const updatedFieldIds = config.fieldIds.filter((id) => id !== fieldToDelete);
        await updateViewConfig(config.id, { fieldIds: updatedFieldIds });
      }

      // Delete the field
      await deleteField(fieldToDelete);

      // Reset state
      setFieldToDelete(null);
      setAffectedConfigs([]);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const handleMoveUp = async (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index <= 0) return; // Already at the top or not found

    // Create new order by swapping with previous field
    const newOrder = [...fields];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    await reorderFields(newOrder.map((f) => f.id));
  };

  const handleMoveDown = async (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1 || index >= fields.length - 1) return; // Already at the bottom or not found

    // Create new order by swapping with next field
    const newOrder = [...fields];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    await reorderFields(newOrder.map((f) => f.id));
  };

  return (
    <div className="fields-page">
      <div className="container">
        <div className="fields-page__header">
          <h2>Messfelder</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
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
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={editingField ? 'Feld bearbeiten' : 'Neues Feld'}
        >
          <FieldForm
            onSubmit={editingField ? handleUpdateField : handleAddField}
            onCancel={handleModalClose}
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
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setAffectedConfigs([]);
            setFieldToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Feld löschen"
          message={
            affectedConfigs.length > 0
              ? `Möchtest du dieses Feld wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.\n\n⚠️ Dieses Feld wird in folgenden Ansichtskonfigurationen verwendet:\n${affectedConfigs.map((c) => `• ${c.name}`).join('\n')}\n\nDas Feld wird aus diesen Konfigurationen entfernt.`
              : 'Möchtest du dieses Feld wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.'
          }
          confirmText="Löschen"
          cancelText="Abbrechen"
        />
      </div>
    </div>
  );
}
