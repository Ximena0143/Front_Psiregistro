import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, AlertCircle } from 'react-feather';
import Swal from 'sweetalert2';
import reminderService from '../../../services/reminder';
import styles from './styles.module.css';

const ListaRecordatorios = ({ patientId, onAddNew, onEditReminder }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar recordatorios del paciente
  const loadReminders = useCallback(async () => {
      try {
        setLoading(true);
        const data = await reminderService.getPatientReminders(patientId);
        setReminders(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar recordatorios:', err);
        setError('No se pudieron cargar los recordatorios. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }, [patientId]);

    useEffect(() => {
    loadReminders();
  }, [patientId, loadReminders]);

  // Eliminar recordatorio
  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar recordatorio?',
      text: `¿Está seguro de eliminar el recordatorio "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reminderService.deleteReminder(id);
          Swal.fire(
            'Eliminado',
            'El recordatorio ha sido eliminado correctamente',
            'success'
          );
          loadReminders(); // Recargar la lista
        } catch (error) {
          Swal.fire(
            'Error',
            'No se pudo eliminar el recordatorio',
            'error'
          );
        }
      }
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Cargando recordatorios...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.recordatoriosContainer}>
      <div className={styles.recordatoriosHeader}>
        <h3>Recordatorios del paciente</h3>
        <button 
          className={styles.addButton} 
          onClick={onAddNew}
          title="Agregar recordatorio"
        >
          <Plus size={20} />
          <span>Nuevo recordatorio</span>
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>No hay recordatorios para este paciente</p>
          <button onClick={onAddNew} className={styles.addEmptyButton}>
            Crear primer recordatorio
          </button>
        </div>
      ) : (
        <div className={styles.remindersList}>
          {reminders.map((reminder) => (
            <div key={reminder.id} className={styles.reminderCard}>
              <div className={styles.reminderHeader}>
                <h4>{reminder.title}</h4>
                <div className={styles.reminderActions}>
                  <button 
                    onClick={() => onEditReminder(reminder)}
                    className={styles.editButton}
                    title="Editar recordatorio"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(reminder.id, reminder.title)}
                    className={styles.deleteButton}
                    title="Eliminar recordatorio"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className={styles.reminderDate}>
                {formatDate(reminder.created_at)}
              </p>
              <div className={styles.reminderDescription}>
                {reminder.description ? (
                  <p>{reminder.description}</p>
                ) : (
                  <p className={styles.noDescription}>Sin descripción</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reminders.length > 0 && reminders.length >= 20 && (
        <div className={styles.limitWarning}>
          <AlertCircle size={16} />
          <p>Has alcanzado el límite de 20 recordatorios para este paciente</p>
        </div>
      )}
    </div>
  );
};

export default ListaRecordatorios;
