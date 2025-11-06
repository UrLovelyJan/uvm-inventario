import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoveRight, Search, AlertCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const ModalMoverEquipo = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        equipo_id: '',
        de_laboratorio_id: '',
        a_laboratorio_id: '',
        cantidad: 1,
        motivo: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Obtener datos necesarios
    const { data: equiposData } = useApi('/api/equipos');
    const { data: laboratoriosData } = useApi('/api/laboratorios');

    useEffect(() => {
        if (isOpen) {
            // Resetear form cuando se abre el modal
            setFormData({
                equipo_id: '',
                de_laboratorio_id: '',
                a_laboratorio_id: '',
                cantidad: 1,
                motivo: ''
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.equipo_id) {
            newErrors.equipo_id = 'Selecciona un equipo';
        }

        if (!formData.a_laboratorio_id) {
            newErrors.a_laboratorio_id = 'Selecciona un laboratorio destino';
        }

        if (formData.de_laboratorio_id && formData.de_laboratorio_id === formData.a_laboratorio_id) {
            newErrors.a_laboratorio_id = 'El laboratorio destino debe ser diferente al origen';
        }

        if (!formData.cantidad || formData.cantidad <= 0) {
            newErrors.cantidad = 'La cantidad debe ser mayor a 0';
        }

        if (!formData.motivo || formData.motivo.length < 5) {
            newErrors.motivo = 'El motivo debe tener al menos 5 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('uvm_token');
            const response = await fetch('/api/movimientos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al realizar el movimiento');
            }

            await response.json();
            
            onSuccess('Movimiento realizado exitosamente');
            onClose();

        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const equiposDisponibles = equiposData?.equipos?.filter(equipo => 
        equipo.estado === 'OPERATIVO' && equipo.cantidad_disponible > 0
    ) || [];

    const equipoSeleccionado = equiposDisponibles.find(e => e.id == formData.equipo_id);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-uvm-primary/10 rounded-lg">
                                    <MoveRight size={24} className="text-uvm-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-uvm-dark">
                                        Mover Equipo
                                    </h2>
                                    <p className="text-sm text-uvm-gray-500">
                                        Transferir equipos entre laboratorios
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            {errors.submit && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                    <AlertCircle size={20} />
                                    <span>{errors.submit}</span>
                                </div>
                            )}

                            {/* Equipo */}
                            <div>
                                <label className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                    Equipo a Mover *
                                </label>
                                <select
                                    name="equipo_id"
                                    value={formData.equipo_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all ${
                                        errors.equipo_id ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Seleccionar equipo</option>
                                    {equiposDisponibles.map(equipo => (
                                        <option key={equipo.id} value={equipo.id}>
                                            {equipo.codigo_inventario} - {equipo.marca} {equipo.modelo} 
                                            {equipo.laboratorio_nombre && ` (${equipo.laboratorio_nombre})`}
                                            {equipo.cantidad_disponible && ` - Disponible: ${equipo.cantidad_disponible}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.equipo_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.equipo_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Laboratorio Origen */}
                                <div>
                                    <label className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                        Laboratorio Origen
                                    </label>
                                    <select
                                        name="de_laboratorio_id"
                                        value={formData.de_laboratorio_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Seleccionar origen (opcional)</option>
                                        {laboratoriosData?.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.nombre} - {lab.sede_nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-uvm-gray-500">
                                        Dejar vacío para alta de nuevo equipo
                                    </p>
                                </div>

                                {/* Laboratorio Destino */}
                                <div>
                                    <label className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                        Laboratorio Destino *
                                    </label>
                                    <select
                                        name="a_laboratorio_id"
                                        value={formData.a_laboratorio_id}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all ${
                                            errors.a_laboratorio_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Seleccionar destino</option>
                                        {laboratoriosData?.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.nombre} - {lab.sede_nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.a_laboratorio_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.a_laboratorio_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Cantidad y Motivo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                        Cantidad *
                                    </label>
                                    <input
                                        type="number"
                                        name="cantidad"
                                        min="1"
                                        max={equipoSeleccionado?.cantidad_disponible}
                                        value={formData.cantidad}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all ${
                                            errors.cantidad ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.cantidad && (
                                        <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                                    )}
                                    {equipoSeleccionado && (
                                        <p className="mt-1 text-xs text-uvm-gray-500">
                                            Máximo disponible: {equipoSeleccionado.cantidad_disponible}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                    Motivo del Movimiento *
                                </label>
                                <textarea
                                    name="motivo"
                                    rows="3"
                                    value={formData.motivo}
                                    onChange={handleChange}
                                    placeholder="Describe el motivo de este movimiento..."
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all resize-none ${
                                        errors.motivo ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.motivo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
                                )}
                                <p className="mt-1 text-xs text-uvm-gray-500">
                                    Mínimo 5 caracteres
                                </p>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-uvm-primary text-white px-6 py-2 rounded-xl hover:bg-uvm-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <MoveRight size={16} />
                                        Realizar Movimiento
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ModalMoverEquipo;