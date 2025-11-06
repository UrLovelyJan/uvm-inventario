import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Filter, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Historial = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: historial, loading, error } = useApi('/api/historial');

    const filteredHistorial = historial?.filter(item => 
        item.equipo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detalle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAccionColor = (accion) => {
        switch (accion) {
            case 'ALTA': return 'bg-green-100 text-green-800';
            case 'BAJA': return 'bg-red-100 text-red-800';
            case 'MOVIMIENTO': return 'bg-blue-100 text-blue-800';
            case 'ACTUALIZACION': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAccionText = (accion) => {
        switch (accion) {
            case 'ALTA': return 'Alta';
            case 'BAJA': return 'Baja';
            case 'MOVIMIENTO': return 'Movimiento';
            case 'ACTUALIZACION': return 'Actualización';
            default: return accion;
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando historial..." />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Error al cargar historial: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                    Historial del Sistema
                </h1>
                <p className="text-uvm-gray-500">
                    Registro completo de todas las acciones realizadas
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uvm-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar en historial..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter size={20} />
                        Filtrar por fecha
                    </button>
                </div>
            </div>

            {/* Lista de Historial */}
            <div className="space-y-4">
                {filteredHistorial?.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccionColor(item.accion)}`}>
                                    {getAccionText(item.accion)}
                                </span>
                                <span className="text-sm text-uvm-gray-500 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(item.creado_en).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h3 className="font-semibold text-uvm-dark mb-1">
                                {item.equipo_nombre}
                            </h3>
                            <p className="text-uvm-gray-700 text-sm">
                                {item.detalle}
                            </p>
                        </div>

                        <div className="flex justify-between items-center text-sm text-uvm-gray-500">
                            <span>Por: {item.usuario_nombre}</span>
                            {item.laboratorio_nombre && (
                                <span>Laboratorio: {item.laboratorio_nombre}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredHistorial?.length === 0 && (
                <div className="text-center py-12">
                    <History size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">No se encontraron registros en el historial</p>
                </div>
            )}
        </div>
    );
};

export default Historial;