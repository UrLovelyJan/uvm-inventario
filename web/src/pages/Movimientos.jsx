import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoveRight, Search, Filter, Plus } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Movimientos = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: movimientos, loading, error } = useApi('/api/movimientos');

    const filteredMovimientos = movimientos?.filter(mov => 
        mov.equipo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner text="Cargando movimientos..." />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Error al cargar movimientos: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                        Movimientos
                    </h1>
                    <p className="text-uvm-gray-500">
                        Historial de movimientos entre laboratorios
                    </p>
                </div>
                <button className="bg-uvm-primary text-white px-4 py-2 rounded-xl hover:bg-uvm-dark transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    Nuevo Movimiento
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uvm-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter size={20} />
                        Filtros Avanzados
                    </button>
                </div>
            </div>

            {/* Lista de Movimientos */}
            <div className="space-y-4">
                {filteredMovimientos?.map((movimiento, index) => (
                    <motion.div
                        key={movimiento.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-uvm-primary/10 rounded-xl">
                                    <MoveRight size={20} className="text-uvm-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-uvm-dark">
                                        {movimiento.equipo_nombre}
                                    </h3>
                                    <p className="text-sm text-uvm-gray-500">
                                        {movimiento.origen_nombre ? 
                                            `${movimiento.origen_nombre} → ${movimiento.destino_nombre}` : 
                                            `Alta en ${movimiento.destino_nombre}`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-uvm-dark text-lg">
                                    {movimiento.cantidad} unidades
                                </p>
                                <p className="text-sm text-uvm-gray-500">
                                    {new Date(movimiento.creado_en).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-uvm-gray-700">{movimiento.motivo}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-uvm-gray-500">
                                    Por: {movimiento.usuario_nombre}
                                </span>
                                <span className="text-sm text-uvm-gray-500">
                                    {movimiento.codigo_inventario}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredMovimientos?.length === 0 && (
                <div className="text-center py-12">
                    <MoveRight size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">No se encontraron movimientos</p>
                </div>
            )}
        </div>
    );
};

export default Movimientos;