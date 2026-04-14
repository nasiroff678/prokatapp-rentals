import { TabType } from '@/types/equipment';
import { Clock, CheckCircle, Package, BarChart3 } from 'lucide-react';
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
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
];

export function BottomNav({ activeTab, onTabChange, rentedCount, availableCount, warehouseCount, isAdmin = false }: BottomNavProps) {
  const visibleTabs = tabs.filter(t => isAdmin || (t.id !== 'warehouse' && t.id !== 'reports'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'rented' ? rentedCount : id === 'available' ? availableCount : id === 'warehouse' ? warehouseCount : 0;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-12 transition-colors duration-300 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(20,185,129,0.5)]' : ''}`} />
                  {badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 border border-background"
                    >
                      {badge}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight">{label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
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
