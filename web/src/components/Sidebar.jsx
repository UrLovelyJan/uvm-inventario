import React from 'react';
import { motion } from 'framer-motion';
import { 
    Monitor, 
    Building, 
    MoveRight, 
    History,
    Users,
    Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Monitor },
        { name: 'Sedes', href: '/sedes', icon: Building },
        { name: 'Laboratorios', href: '/laboratorios', icon: Building },
        { name: 'Equipos', href: '/equipos', icon: Monitor },
        { name: 'Movimientos', href: '/movimientos', icon: MoveRight },
        { name: 'Historial', href: '/historial', icon: History },
    ];

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: isOpen ? 0 : -300 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-uvm-dark text-white lg:static lg:translate-x-0 lg:z-auto"
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-uvm-gray-800">
                        <span className="text-xl font-bold">UVM Inventario</span>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 mt-8 px-4 space-y-2">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-uvm-gray-800 transition-colors text-uvm-gray-500 hover:text-white"
                            >
                                <item.icon size={20} />
                                {item.name}
                            </a>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-uvm-gray-800">
                        <div className="flex items-center gap-3 px-3 py-2 text-uvm-gray-500">
                            <Settings size={20} />
                            <span className="text-sm">Configuración</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;