import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX } from 'lucide-react';

const Usuarios = () => {
    // Datos de ejemplo - en una app real vendrían de la API
    const usuarios = [
        {
            id: 1,
            nombre: 'Juan Carlos Mendoza',
            usuario: 'jefe_depto',
            email: 'juan.mendoza@uvm.edu.mx',
            rol: 'JEFE',
            activo: true,
            creado_en: '2024-01-15'
        },
        {
            id: 2,
            nombre: 'María Elena Ruiz',
            usuario: 'aux_labs',
            email: 'maria.ruiz@uvm.edu.mx',
            rol: 'AUXILIAR',
            activo: true,
            creado_en: '2024-01-15'
        }
    ];

    const getRolColor = (rol) => {
        return rol === 'JEFE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
    };

    const getEstadoIcon = (activo) => {
        return activo ? 
            <UserCheck size={16} className="text-green-600" /> : 
            <UserX size={16} className="text-red-600" />;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                    Gestión de Usuarios
                </h1>
                <p className="text-uvm-gray-500">
                    Administración de usuarios del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-uvm-gray-700">Total Usuarios</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {usuarios.length}
                            </p>
                        </div>
                        <div className="p-3 bg-uvm-primary/10 rounded-xl">
                            <Users size={24} className="text-uvm-primary" />
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
                            <p className="text-sm font-medium text-uvm-gray-700">Jefes de Departamento</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {usuarios.filter(u => u.rol === 'JEFE').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <UserCheck size={24} className="text-purple-600" />
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
                            <p className="text-sm font-medium text-uvm-gray-700">Auxiliares</p>
                            <p className="text-2xl font-bold text-uvm-dark mt-2">
                                {usuarios.filter(u => u.rol === 'AUXILIAR').length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Users size={24} className="text-blue-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                                Usuario
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                                Información
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                                Rol
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                                Estado
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-uvm-gray-700">
                                Fecha de Alta
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario, index) => (
                            <motion.tr
                                key={usuario.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div>
                                        <p className="font-medium text-uvm-dark">
                                            {usuario.usuario}
                                        </p>
                                        <p className="text-sm text-uvm-gray-500">
                                            {usuario.email}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-uvm-dark">{usuario.nombre}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                                        {usuario.rol}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        {getEstadoIcon(usuario.activo)}
                                        <span className={usuario.activo ? 'text-green-600' : 'text-red-600'}>
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-uvm-gray-500">
                                        {new Date(usuario.creado_en).toLocaleDateString('es-ES')}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Usuarios;