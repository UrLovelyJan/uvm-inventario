import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Monitor, 
    Building, 
    TrendingUp,
    Search,
    Filter,
    MoveRight,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const Dashboard = ({ user }) => {
    const { getToken } = useAuth();

    const [stats, setStats] = useState({
        totalEquipos: 0,
        totalLaboratorios: 0,
        equiposOperativos: 0,
        movimientosHoy: 0
    });

    const [movimientosRecientes, setMovimientosRecientes] = useState([]);
    const [distribucionSedes, setDistribucionSedes] = useState([]); 


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = getToken();

                const res = await axios.get("http://localhost:3000/api/dashboard/resumen", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats({
                    totalEquipos: res.data.metrics.total_equipos ?? 0,
                    totalLaboratorios: res.data.metrics.total_laboratorios ?? 0,
                    equiposOperativos: res.data.metrics.equipos_operativos ?? 0,
                    movimientosHoy: res.data.metrics.movimientos_hoy ?? 0
                });

                setMovimientosRecientes(res.data.recentMovements ?? []);
                setDistribucionSedes(res.data.distribution ?? []);


            } catch (err) {
                console.error("Error cargando dashboard:", err);
            }
        };

        fetchDashboardData();
    }, [getToken]);



    const StatCard = ({ icon: Icon, label, value, change }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-uvm-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-uvm-dark mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change}% vs mes anterior
                        </p>
                    )}
                </div>
                <div className="p-3 bg-uvm-primary/10 rounded-xl">
                    <Icon size={24} className="text-uvm-primary" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-uvm-dark">Dashboard</h1>
                        <p className="text-uvm-gray-500">
                            Bienvenido, {user.nombre}. {new Date().toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uvm-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar equipos, laboratorios..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-uvm-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                            <Filter size={20} />
                            <span>Filtros</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={Monitor} label="Total de Equipos" value={stats.totalEquipos} />
                    <StatCard icon={Building} label="Laboratorios Activos" value={stats.totalLaboratorios} />
                    <StatCard icon={TrendingUp} label="Equipos Operativos" value={stats.equiposOperativos} />
                    <StatCard icon={MoveRight} label="Movimientos Hoy" value={stats.movimientosHoy} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Movimientos Recientes */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-uvm-dark">
                                Movimientos Recientes
                            </h2>
                            <button className="text-uvm-primary hover:text-uvm-dark text-sm font-medium transition-colors">
                                Ver todos
                            </button>
                        </div>

                        <div className="space-y-4">
                            {movimientosRecientes.map((movimiento) => (
                                <motion.div
                                    key={movimiento.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-uvm-primary/10 rounded-lg">
                                            <MoveRight size={16} className="text-uvm-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-uvm-dark">
                                                {movimiento.equipo}
                                            </p>
                                            <p className="text-sm text-uvm-gray-500">
                                                {movimiento.origen ? 
                                                    `${movimiento.origen} → ${movimiento.destino}` : 
                                                    `Alta en ${movimiento.destino}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-uvm-dark">
                                            {movimiento.cantidad} unidades
                                        </p>
                                        <p className="text-sm text-uvm-gray-500 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(movimiento.creado_en).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Distribución por Sede (Sigue estático por ahora) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-lg font-semibold text-uvm-dark mb-6">
                            Distribución por Sede
                        </h2>
                        <div className="space-y-4">
                            {distribucionSedes.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-uvm-dark">{item.sede}</span>
                                            <span className="text-uvm-gray-500">
                                                {item.porcentaje_disponible ?? 0}% disponible
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-uvm-primary h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${item.porcentaje_disponible ?? 0}%` }}
                                            ></div>
                                        </div>

                                        <p className="text-xs text-uvm-gray-500 mt-1">
                                            {item.total_equipos ?? 0} equipos • {item.laboratorios ?? 0} laboratorios
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
