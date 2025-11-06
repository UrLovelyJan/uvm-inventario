import React from 'react';
import { motion } from 'framer-motion';
import { MoveRight, Edit, MoreVertical, Monitor } from 'lucide-react';

const TableEquipos = ({ equipos, filters, searchTerm }) => {
    const filteredEquipos = equipos.filter(equipo => {
        const matchesSearch = equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            equipo.codigo_inventario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTipo = !filters.tipo || equipo.tipo === filters.tipo;
        const matchesEstado = !filters.estado || equipo.estado === filters.estado;
        
        return matchesSearch && matchesTipo && matchesEstado;
    });

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'OPERATIVO': return 'bg-green-100 text-green-800';
            case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-800';
            case 'BAJA': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 'OPERATIVO': return 'Operativo';
            case 'MANTENIMIENTO': return 'Mantenimiento';
            case 'BAJA': return 'Baja';
            default: return estado;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Código Inventario
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Equipo
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Tipo
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Estado
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Laboratorio
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEquipos.map((equipo, index) => (
                        <motion.tr
                            key={equipo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                            <td className="py-4 px-6">
                                <span className="font-mono text-sm text-uvm-primary font-medium">
                                    {equipo.codigo_inventario}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div>
                                    <p className="font-medium text-uvm-dark">
                                        {equipo.marca} {equipo.modelo}
                                    </p>
                                    <p className="text-sm text-uvm-gray-500">
                                        {equipo.serie}
                                    </p>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {equipo.tipo}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(equipo.estado)}`}>
                                    {getEstadoText(equipo.estado)}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-uvm-dark">
                                    {equipo.laboratorio_nombre || 'No asignado'}
                                </p>
                                <p className="text-sm text-uvm-gray-500">
                                    {equipo.sede_nombre}
                                </p>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-uvm-primary hover:bg-uvm-primary/10 rounded-lg transition-colors">
                                        <MoveRight size={16} />
                                    </button>
                                    <button className="p-2 text-uvm-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-2 text-uvm-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            {filteredEquipos.length === 0 && (
                <div className="text-center py-12">
                    <Monitor size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">No se encontraron equipos</p>
                </div>
            )}
        </div>
    );
};

export default TableEquipos;