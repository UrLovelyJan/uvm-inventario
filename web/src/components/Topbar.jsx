import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown, LogOut, Settings } from 'lucide-react';

const Topbar = ({ onMenuToggle, user, onLogout }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={20} className="text-uvm-gray-700" />
                    </button>
                    <div className="ml-4 lg:ml-0">
                        <nav className="flex text-sm">
                            <a href="/dashboard" className="text-uvm-gray-500 hover:text-uvm-dark">
                                Dashboard
                            </a>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-uvm-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user?.nombre?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-uvm-dark">
                                    {user?.nombre}
                                </p>
                                <p className="text-xs text-uvm-gray-500 capitalize">
                                    {user?.rol_nombre?.toLowerCase()}
                                </p>
                            </div>
                            <ChevronDown size={16} className="text-uvm-gray-500" />
                        </button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                                >
                                    <a
                                        href="/perfil"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-uvm-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Settings size={16} />
                                        Configuración
                                    </a>
                                    <button
                                        onClick={onLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-uvm-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;