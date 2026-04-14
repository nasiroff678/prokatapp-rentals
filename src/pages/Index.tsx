import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, PaymentMethod } from '@/types/equipment';
import { BottomNav } from '@/components/BottomNav';
import { RentedTab } from '@/components/RentedTab';
import { AvailableTab } from '@/components/AvailableTab';
import { WarehouseTab } from '@/components/WarehouseTab';
import { ReportsTab } from '@/components/ReportsTab';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  useEquipment, 
  useOrders, 
  useUpdateEquipmentStatus, 
  useAddEquipment, 
  useCreateOrder, 
  useCompleteOrder,
  useExtendOrder,
  useEditEquipment,
  useDeleteEquipment
} from '@/hooks/useSupabase';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tabTitles: Record<TabType, string> = {
  rented: 'Занятые',
  available: 'Свободные',
  warehouse: 'Склад',
  reports: 'Отчёты',
};

const Index = () => {
  const currentStaff = useAuthStore(state => state.currentStaff);
  const isAdmin = currentStaff?.role === 'admin';
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const logout = useAuthStore(state => state.logout);

  const { data: equipment = [], isLoading: EqLoading } = useEquipment();
  const { data: orders = [], isLoading: OrdersLoading } = useOrders();

  const { mutate: updateStatus } = useUpdateEquipmentStatus();
  const { mutate: addEq } = useAddEquipment();
  const { mutate: editEq } = useEditEquipment();
  const { mutate: deleteEq } = useDeleteEquipment();
  const { mutate: createOrderMutate } = useCreateOrder();
  const { mutate: completeOrderMutate } = useCompleteOrder();
  const { mutate: extendOrderMutate } = useExtendOrder();

  const activeOrders = orders.filter(o => o.status === 'active');
  const availableEquipment = equipment.filter(e => e.status === 'available');
  const warehouseEquipment = equipment.filter(e => e.status === 'warehouse');

  const isLoading = EqLoading || OrdersLoading;

  const handleCreateOrder = (
    equipmentId: string,
    customerName: string,
    customerPhone: string,
    rentalHours: number,
    deposit: number,
    paymentMethod: PaymentMethod,
    documentFile: File | undefined,
    totalPrice: number,
    startTime: string,
    endTime: string
  ) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;
    createOrderMutate({
      equipmentId,
      customerName,
      customerPhone,
      rentalHours,
      pricePerHour: item.pricePerHour,
      totalPrice,
      deposit,
      paymentMethod,
      documentFile,
      startTime,
      endTime,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 grain overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="flex items-center justify-between px-6 h-16 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary drop-shadow-[0_0_8px_rgba(20,185,129,0.5)]">PROKAT</span>APP
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.span 
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5"
            >
              {tabTitles[activeTab]}
            </motion.span>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-muted-foreground">
            <p className="animate-pulse">Загрузка данных...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === 'rented' && (
                <RentedTab 
                  orders={activeOrders} 
                  onComplete={(id, penaltyAmount = 0) => {
                    const order = activeOrders.find(o => o.id === id);
                    if (order) completeOrderMutate({ orderId: id, equipmentId: order.equipmentId, penaltyAmount });
                  }} 
                  onExtend={(id, extraHours, addPrice) => extendOrderMutate({ orderId: id, extraHours, addPrice })}
                />
              )}
              {activeTab === 'available' && (
                <AvailableTab 
                  equipment={availableEquipment} 
                  onCreateOrder={handleCreateOrder} 
                  onMoveToWarehouse={(id) => updateStatus({ id, status: 'warehouse' })}
                />
              )}
              {activeTab === 'warehouse' && isAdmin && (
                <WarehouseTab
                  equipment={warehouseEquipment}
                  onMoveToAvailable={(id) => updateStatus({ id, status: 'available' })}
                  onAddEquipment={(name, category, pricePerHour, deposit, imageFile) => addEq({ name, category, pricePerHour, deposit, imageFile, status: 'warehouse' })}
                  onEditEquipment={(id, name, category, pricePerHour, deposit) => editEq({ id, name, category, pricePerHour, deposit })}
                  onDeleteEquipment={(id) => deleteEq(id)}
                />
              )}
              {activeTab === 'reports' && isAdmin && (
                <ReportsTab orders={orders} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rentedCount={activeOrders.length}
        availableCount={availableEquipment.length}
        warehouseCount={warehouseEquipment.length}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Index;
