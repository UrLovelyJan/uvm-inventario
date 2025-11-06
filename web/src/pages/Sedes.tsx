import React from 'react';
import { motion } from 'framer-motion';
import { Building, Monitor, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';

const Sedes = () => {
    const { data: sedes, loading, error } = useApi('/api/sedes');

    if (loading) {
        return <LoadingSpinner text="Cargando sedes..." />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Error al cargar sedes: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                    Sedes UVM
                </h1>
                <p className="text-uvm-gray-500">
                    Gestión de todas las sedes y sus laboratorios
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sedes?.map((sede, index) => (
                    <motion.div
                        key={sede.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-uvm-primary/10 rounded-xl">
                                <Building size={24} className="text-uvm-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-uvm-dark">
                                    {sede.nombre}
                                </h3>
                                <p className="text-sm text-uvm-gray-500">
                                    {sede.region}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Laboratorios</span>
                                <span className="font-semibold text-uvm-dark">
                                    {sede.total_laboratorios}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Equipos</span>
                                <span className="font-semibold text-uvm-dark">
                                    {sede.total_equipos}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-uvm-gray-600">Estado</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    sede.activa 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {sede.activa ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {sedes?.length === 0 && (
                <div className="text-center py-12">
                    <Building size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">No se encontraron sedes</p>
                </div>
            )}
        </div>
    );
};

export default Sedes;