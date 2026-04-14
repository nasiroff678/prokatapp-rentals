export type EquipmentStatus = 'warehouse' | 'available' | 'rented';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  pricePerHour: number;
  image?: string;
}

export interface Order {
  id: string;
  equipmentId: string;
  equipmentName: string;
  customerName: string;
  customerPhone: string;
  rentalHours: number;
  pricePerHour: number;
  totalPrice: number;
  deposit: number;
  paymentMethod: PaymentMethod;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: 'active' | 'completed' | 'overdue';
}

export interface DailyReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalDeposits: number;
  avgRentalHours: number;
  topEquipment: string;
}

export type TabType = 'rented' | 'available' | 'warehouse' | 'reports';
