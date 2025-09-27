import React, { useState, useEffect } from 'react';
import { X, Save } from 'react-feather';
import Swal from 'sweetalert2';
import reminderService from '../../../services/reminder';
import styles from './styles.module.css';

const FormularioRecordatorio = ({ patientId, reminderToEdit, onClose, onSuccess }) => {
  // Estado inicial del formulario
  const initialState = {
    title: '',
    description: '',
    patient_id: patientId
  };

  // Estado del formulario
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Modo edición o creación
  const isEditMode = Boolean(reminderToEdit?.id);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (reminderToEdit) {
      setFormData({
        title: reminderToEdit.title || '',
        description: reminderToEdit.description || '',
        patient_id: patientId
      });
    } else {
      setFormData(initialState);
    }
  }, [reminderToEdit, patientId]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al cambiar un campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length > 150) {
      newErrors.title = 'El título no puede exceder los 150 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode) {
        // Actualizar recordatorio existente
        await reminderService.updateReminder(reminderToEdit.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Recordatorio actualizado',
          text: 'El recordatorio ha sido actualizado correctamente'
        });
      } else {
        // Crear nuevo recordatorio
        await reminderService.createReminder(formData);
        Swal.fire({
          icon: 'success',
          title: 'Recordatorio creado',
          text: 'El recordatorio ha sido creado correctamente'
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
      
      // Mostrar mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el recordatorio. Inténtalo nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3>{isEditMode ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h3>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          title="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Escribe un título para el recordatorio"
            maxLength="150"
            className={errors.title ? styles.inputError : ''}
            disabled={loading}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          <small className={styles.charCount}>{formData.title.length}/150</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Agrega detalles adicionales (opcional)"
            rows="5"
            className={errors.description ? styles.inputError : ''}
            disabled={loading}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditMode ? 'Actualizar' : 'Guardar'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRecordatorio;
