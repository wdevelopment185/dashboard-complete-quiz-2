import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, ChevronDown, Database, Server } from 'lucide-react';
import { getHealth } from '../services/api';

const HealthBadge = () => {
  const [health, setHealth] = useState({
    status: 'checking',
    services: {
      server: { status: 'unknown' },
      database: { status: 'unknown' }
    }
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await getHealth();
        setHealth(data);
      } catch (error) {
        setHealth({
          status: 'unhealthy',
          services: {
            server: { status: 'unhealthy', message: 'Connection failed' },
            database: { status: 'unknown', message: 'Unable to check' }
          }
        });
      }
    };

    // Check immediately
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const stylesByStatus = {
    healthy: {
      button: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500 ring-2 ring-emerald-200',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />,
      chip: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    unhealthy: {
      button: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500 ring-2 ring-rose-200',
      icon: <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />,
      chip: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    checking: {
      button: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500 ring-2 ring-amber-200',
      icon: <Loader2 className="h-4 w-4 text-amber-600 animate-spin" aria-hidden />,
      chip: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    unknown: {
      button: 'bg-slate-50 text-slate-700 border-slate-200',
      dot: 'bg-slate-400 ring-2 ring-slate-200',
      icon: <AlertTriangle className="h-4 w-4 text-slate-600" aria-hidden />,
      chip: 'text-slate-700 bg-slate-50 border-slate-200'
    }
  };

  const statusStyle = stylesByStatus[health.status] || stylesByStatus.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm transition-all duration-200 ${statusStyle.button}`}
        aria-expanded={isExpanded}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
        <div className="flex-1 text-left leading-tight">
          <div className="text-xs font-semibold tracking-wide">System Health</div>
          <div className="text-[11px] opacity-80 capitalize">{health.status}</div>
        </div>
        {statusStyle.icon}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
        </motion.div>
      </motion.button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute top-full mt-2 right-0 p-4 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 min-w-[280px]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Server className="h-4 w-4 text-gray-500" />
                <span>Server</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md border text-xs capitalize ${statusStyle.chip}`}>
                {health.services?.server?.status || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Database className="h-4 w-4 text-gray-500" />
                <span>Database</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md border text-xs capitalize ${statusStyle.chip}`}>
                {health.services?.database?.status || 'unknown'}
              </span>
            </div>
            {health.system && (
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Uptime: {Math.floor(health.system.uptime / 60)}m</div>
                <div>Memory: {health.system.memory?.usagePercent?.toFixed(1)}%</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HealthBadge;