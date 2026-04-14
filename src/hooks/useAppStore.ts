import { useState, useCallback } from 'react';
import { Equipment, Order, EquipmentStatus, PaymentMethod } from '@/types/equipment';

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: '1', name: 'Велосипед горный', category: 'Велосипеды', status: 'available', pricePerHour: 300 },
  { id: '2', name: 'Велосипед городской', category: 'Велосипеды', status: 'available', pricePerHour: 250 },
  { id: '3', name: 'Электросамокат', category: 'Самокаты', status: 'warehouse', pricePerHour: 400 },
  { id: '4', name: 'Самокат детский', category: 'Самокаты', status: 'warehouse', pricePerHour: 150 },
  { id: '5', name: 'Ролики взрослые', category: 'Ролики', status: 'available', pricePerHour: 200 },
  { id: '6', name: 'Ролики детские', category: 'Ролики', status: 'warehouse', pricePerHour: 150 },
  { id: '7', name: 'SUP-борд', category: 'Водное', status: 'available', pricePerHour: 500 },
  { id: '8', name: 'Каяк одноместный', category: 'Водное', status: 'warehouse', pricePerHour: 600 },
];

export function useAppStore() {
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [orders, setOrders] = useState<Order[]>([]);

  const moveEquipment = useCallback((id: string, newStatus: EquipmentStatus) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  }, []);

  const createOrder = useCallback((
    equipmentId: string,
    customerName: string,
    customerPhone: string,
    rentalHours: number,
    deposit: number,
    paymentMethod: PaymentMethod,
  ) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;

    const now = new Date();
    const endTime = new Date(now.getTime() + rentalHours * 60 * 60 * 1000);

    const order: Order = {
      id: crypto.randomUUID(),
      equipmentId,
      equipmentName: item.name,
      customerName,
      customerPhone,
      rentalHours,
      pricePerHour: item.pricePerHour,
      totalPrice: item.pricePerHour * rentalHours,
      deposit,
      paymentMethod,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      status: 'active',
    };

    setOrders(prev => [order, ...prev]);
    moveEquipment(equipmentId, 'rented');
  }, [equipment, moveEquipment]);

  const completeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'completed' as const };
      }
      return o;
    }));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      moveEquipment(order.equipmentId, 'available');
    }
  }, [orders, moveEquipment]);

  const addEquipment = useCallback((name: string, category: string, pricePerHour: number) => {
    const newItem: Equipment = {
      id: crypto.randomUUID(),
      name,
      category,
      pricePerHour,
      status: 'warehouse',
    };
    setEquipment(prev => [...prev, newItem]);
  }, []);

  const activeOrders = orders.filter(o => o.status === 'active');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const availableEquipment = equipment.filter(e => e.status === 'available');
  const warehouseEquipment = equipment.filter(e => e.status === 'warehouse');
  const rentedEquipment = equipment.filter(e => e.status === 'rented');

  return {
    equipment,
    orders,
    activeOrders,
    completedOrders,
    availableEquipment,
    warehouseEquipment,
    rentedEquipment,
    moveEquipment,
    createOrder,
    completeOrder,
    addEquipment,
  };
}
