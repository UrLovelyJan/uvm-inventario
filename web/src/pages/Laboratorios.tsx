import React from 'react';
import { motion } from 'framer-motion';
import { Building, Monitor, Cpu } from 'lucide-react';
import { useApi } from '../hooks/useApi.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';

const Laboratorios = () => {
    const { data: laboratorios, loading, error } = useApi('/api/laboratorios');

    if (loading) {
        return <LoadingSpinner text="Cargando laboratorios..." />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Error al cargar laboratorios: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                    Laboratorios
                </h1>
                <p className="text-uvm-gray-500">
                    Gestión de laboratorios por sede
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {laboratorios?.map((lab, index) => (
                    <motion.div
                        key={lab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Cpu size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-uvm-dark">
                                    {lab.nombre}
                                </h3>
                                <p className="text-sm text-uvm-gray-500">
                                    {lab.sede_nombre}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Capacidad</span>
                                <span className="font-semibold text-uvm-dark">
                                    {lab.capacidad} equipos
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Equipos actuales</span>
                                <span className="font-semibold text-uvm-dark">
                                    {lab.total_equipos || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Tipos de equipo</span>
                                <span className="font-semibold text-uvm-dark">
                                    {lab.tipos_equipos || 0}
                                </span>
                            </div>
                            {lab.responsable && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-sm text-uvm-gray-600">Responsable</p>
                                    <p className="font-medium text-uvm-dark">
                                        {lab.responsable}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {laboratorios?.length === 0 && (
                <div className="text-center py-12">
                    <Cpu size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">No se encontraron laboratorios</p>
                </div>
            )}
        </div>
    );
};

export default Laboratorios;