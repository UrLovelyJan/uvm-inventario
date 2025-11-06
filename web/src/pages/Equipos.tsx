import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Monitor } from 'lucide-react';
import { useApi } from '../hooks/useApi.ts';
import TableEquipos from '../components/TableEquipos.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';

const Equipos = () => {
    const [filters, setFilters] = useState({
        tipo: '',
        estado: '',
        sede: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const { data: equiposData, loading, error } = useApi('/api/equipos');

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <LoadingSpinner text="Cargando equipos..." />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Error al cargar equipos: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                        Gestión de Equipos
                    </h1>
                    <p className="text-uvm-gray-500">
                        Administra y consulta el inventario de equipos
                    </p>
                </div>
                <button className="bg-uvm-primary text-white px-4 py-2 rounded-xl hover:bg-uvm-dark transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    Nuevo Equipo
                </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uvm-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar equipos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    
                    <select
                        value={filters.tipo}
                        onChange={(e) => handleFilterChange('tipo', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="CPU">CPU</option>
                        <option value="LAPTOP">Laptop</option>
                        <option value="MONITOR">Monitor</option>
                        <option value="PROYECTOR">Proyector</option>
                    </select>

                    <select
                        value={filters.estado}
                        onChange={(e) => handleFilterChange('estado', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Todos los estados</option>
                        <option value="OPERATIVO">Operativo</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="BAJA">Baja</option>
                    </select>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter size={20} />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-uvm-gray-700">Total Equipos</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {equiposData?.total || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Monitor size={24} className="text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-uvm-gray-700">Operativos</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {equiposData?.operativos || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Monitor size={24} className="text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-uvm-gray-700">En Mantenimiento</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {equiposData?.mantenimiento || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Monitor size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabla de Equipos */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <TableEquipos 
                    equipos={equiposData?.equipos || []}
                    filters={filters}
                    searchTerm={searchTerm}
                />
            </motion.div>
        </div>
    );
};

export default Equipos;