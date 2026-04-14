import { useState } from 'react';
import { TabType } from '@/types/equipment';
import { useAppStore } from '@/hooks/useAppStore';
import { BottomNav } from '@/components/BottomNav';
import { RentedTab } from '@/components/RentedTab';
import { AvailableTab } from '@/components/AvailableTab';
import { WarehouseTab } from '@/components/WarehouseTab';
import { ReportsTab } from '@/components/ReportsTab';

const tabTitles: Record<TabType, string> = {
  rented: 'Занятые',
  available: 'Свободные',
  warehouse: 'Склад',
  reports: 'Отчёты',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const store = useAppStore();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="font-heading text-base font-bold tracking-tight">
            <span className="text-primary">PROKAT</span>APP
          </h1>
          <span className="font-heading text-[10px] text-muted-foreground tracking-widest uppercase">
            {tabTitles[activeTab]}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 max-w-lg mx-auto">
        {activeTab === 'rented' && (
          <RentedTab orders={store.activeOrders} onComplete={store.completeOrder} />
        )}
        {activeTab === 'available' && (
          <AvailableTab equipment={store.availableEquipment} onCreateOrder={store.createOrder} />
        )}
        {activeTab === 'warehouse' && (
          <WarehouseTab
            equipment={store.warehouseEquipment}
            onMoveToAvailable={(id) => store.moveEquipment(id, 'available')}
            onAddEquipment={store.addEquipment}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab orders={store.orders} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rentedCount={store.activeOrders.length}
        availableCount={store.availableEquipment.length}
      />
    </div>
  );
};

export default Index;
