import { TabType } from '@/types/equipment';
import { Clock, CheckCircle, Package, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  rentedCount: number;
  availableCount: number;
}

const tabs: { id: TabType; label: string; icon: typeof Clock }[] = [
  { id: 'rented', label: 'Занятые', icon: Clock },
  { id: 'available', label: 'Свободные', icon: CheckCircle },
  { id: 'warehouse', label: 'Склад', icon: Package },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
];

export function BottomNav({ activeTab, onTabChange, rentedCount, availableCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'rented' ? rentedCount : id === 'available' ? availableCount : 0;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
