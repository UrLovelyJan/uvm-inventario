import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        usuario: '',
        contraseña: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onLogin(formData);
        } catch (err) {
            setError('Credenciales incorrectas. Verifique usuario y contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Lado izquierdo - Branding */}
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-uvm-dark">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-white text-center"
                >
                    <div className="w-32 h-32 bg-uvm-primary rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-2xl font-bold">UVM</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Sistema de Inventario</h1>
                    <p className="text-uvm-gray-500 text-lg">
                        Gestión integral de equipos de laboratorio
                    </p>
                </motion.div>
            </div>

            {/* Lado derecho - Formulario */}
            <div className="flex-1 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-12 lg:hidden">
                        <div className="w-20 h-20 bg-uvm-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-bold text-white">UVM</span>
                        </div>
                        <h1 className="text-2xl font-bold text-uvm-dark mb-2">
                            Sistema de Inventario
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label htmlFor="usuario" className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                Usuario
                            </label>
                            <input
                                id="usuario"
                                name="usuario"
                                type="text"
                                required
                                value={formData.usuario}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="Ingrese su usuario"
                            />
                        </div>

                        <div>
                            <label htmlFor="contraseña" className="block text-sm font-medium text-uvm-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="contraseña"
                                    name="contraseña"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.contraseña}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="Ingrese su contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-uvm-gray-500 hover:text-uvm-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-uvm-primary focus:ring-uvm-primary"
                                />
                                <span className="ml-2 text-uvm-gray-700">Recordar sesión</span>
                            </label>
                            <a
                                href="#"
                                className="text-uvm-primary hover:text-uvm-dark transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-uvm-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-uvm-dark transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LogIn size={20} />
                            )}
                            {isLoading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-uvm-gray-500">
                        <p>Sistema exclusivo para personal autorizado UVM</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;