import { TabType } from '@/types/equipment';
import { Clock, CheckCircle, Package, BarChart3, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  rentedCount: number;
  availableCount: number;
  warehouseCount: number;
  isAdmin?: boolean;
}

const tabs: { id: TabType; label: string; icon: typeof Clock }[] = [
  { id: 'rented', label: 'Занятые', icon: Clock },
  { id: 'available', label: 'Свободные', icon: CheckCircle },
  { id: 'warehouse', label: 'Склад', icon: Package },
  { id: 'shift', label: 'Смена', icon: Wallet },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
  { id: 'staff', label: 'Персонал', icon: Users },
];

export function BottomNav({ activeTab, onTabChange, rentedCount, availableCount, warehouseCount, isAdmin = false }: BottomNavProps) {
  // Админ: видит «Отчёты» и «Персонал», но НЕ видит «Смена» (она только для сотрудников)
  // Сотрудник: видит «Смена», но НЕ видит «Отчёты» и «Персонал»
  const visibleTabs = tabs.filter(t => {
    if (isAdmin) return t.id !== 'shift';
    return t.id !== 'staff';
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header safe-area-bottom">
      <div
        className="grid h-24 max-w-lg mx-auto px-1 pb-2 items-center gap-1"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'rented' ? rentedCount : id === 'available' ? availableCount : id === 'warehouse' ? warehouseCount : 0;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 h-20 rounded-xl transition-colors duration-300 sm:gap-1.5 sm:rounded-2xl ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative z-10 flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 sm:gap-1.5 sm:px-1">
                <div className="relative">
                  <Icon className={`h-6 w-6 transition-transform duration-300 sm:h-7 sm:w-7 ${isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(20,185,129,0.6)]' : ''}`} strokeWidth={2.2} />
                  {badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold px-1 border-2 border-background"
                    >
                      {badge}
                    </motion.span>
                  )}
                </div>
                <span className="max-w-full text-center text-[10px] font-semibold leading-none tracking-tight sm:text-[12px]">
                  {label}
                </span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-1 bg-primary/15 rounded-2xl border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
