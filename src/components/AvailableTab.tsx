import { useState } from 'react';
import { Equipment, PaymentMethod } from '@/types/equipment';
import { OrderForm } from './OrderForm';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface AvailableTabProps {
  equipment: Equipment[];
  onCreateOrder: (
    equipmentId: string,
    customerName: string,
    customerPhone: string,
    rentalHours: number,
    deposit: number,
    paymentMethod: PaymentMethod,
  ) => void;
}

export function AvailableTab({ equipment, onCreateOrder }: AvailableTabProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  if (selectedEquipment) {
    return (
      <OrderForm
        equipment={selectedEquipment}
        onSubmit={(eqId, name, phone, hours, deposit, payment) => {
          onCreateOrder(eqId, name, phone, hours, deposit, payment);
          setSelectedEquipment(null);
        }}
        onCancel={() => setSelectedEquipment(null)}
      />
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Всё оборудование занято или на складе</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {equipment.map(item => (
        <button
          key={item.id}
          onClick={() => setSelectedEquipment(item)}
          className="glass-card p-4 w-full text-left flex items-center justify-between group transition-colors hover:border-primary/30"
        >
          <div>
            <h3 className="font-heading text-sm font-semibold">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.pricePerHour} ₽/час</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      ))}
    </div>
  );
}
