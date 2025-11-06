import React from 'react';
import { motion } from 'framer-motion';
import { MoveRight, Calendar, User } from 'lucide-react';

const TableMovimientos = ({ movimientos, searchTerm = '' }) => {
    const filteredMovimientos = movimientos.filter(mov => 
        mov.equipo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.codigo_inventario?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTipoMovimiento = (movimiento) => {
        if (!movimiento.de_laboratorio_id) return 'alta';
        if (!movimiento.a_laboratorio_id) return 'baja';
        return 'transferencia';
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'alta': return 'bg-green-100 text-green-800';
            case 'baja': return 'bg-red-100 text-red-800';
            case 'transferencia': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTipoText = (tipo) => {
        switch (tipo) {
            case 'alta': return 'Alta';
            case 'baja': return 'Baja';
            case 'transferencia': return 'Transferencia';
            default: return tipo;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Equipo
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Movimiento
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Cantidad
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Tipo
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Usuario
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                            Fecha
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMovimientos.map((movimiento, index) => {
                        const tipo = getTipoMovimiento(movimiento);
                        
                        return (
                            <motion.tr
                                key={movimiento.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div>
                                        <p className="font-medium text-uvm-dark">
                                            {movimiento.equipo_nombre}
                                        </p>
                                        <p className="text-sm text-uvm-gray-500 font-mono">
                                            {movimiento.codigo_inventario}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        {tipo === 'transferencia' && (
                                            <>
                                                <span className="text-uvm-gray-500 text-sm">
                                                    {movimiento.origen_nombre}
                                                </span>
                                                <MoveRight size={14} className="text-uvm-gray-400" />
                                            </>
                                        )}
                                        <span className="font-medium text-uvm-dark">
                                            {movimiento.destino_nombre}
                                        </span>
                                    </div>
                                    {movimiento.motivo && (
                                        <p className="text-sm text-uvm-gray-500 mt-1 line-clamp-2">
                                            {movimiento.motivo}
                                        </p>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <span className="font-bold text-uvm-dark text-lg">
                                        {movimiento.cantidad}
                                    </span>
                                    <span className="text-sm text-uvm-gray-500 ml-1">
                                        unidades
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(tipo)}`}>
                                        {getTipoText(tipo)}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-uvm-gray-400" />
                                        <span className="text-uvm-gray-700">
                                            {movimiento.usuario_nombre}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2 text-sm text-uvm-gray-500">
                                        <Calendar size={14} />
                                        {new Date(movimiento.creado_en).toLocaleDateString('es-ES')}
                                    </div>
                                    <div className="text-xs text-uvm-gray-400 mt-1">
                                        {new Date(movimiento.creado_en).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>

            {filteredMovimientos.length === 0 && (
                <div className="text-center py-12">
                    <MoveRight size={48} className="mx-auto text-uvm-gray-300 mb-4" />
                    <p className="text-uvm-gray-500">
                        {searchTerm ? 'No se encontraron movimientos con ese criterio' : 'No hay movimientos registrados'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TableMovimientos;