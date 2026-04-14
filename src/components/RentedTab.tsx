import { Order } from '@/types/equipment';
import { CountdownTimer } from './CountdownTimer';
import { Phone, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RentedTabProps {
  orders: Order[];
  onComplete: (orderId: string) => void;
}

const paymentLabels: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Перевод',
};

export function RentedTab({ orders, onComplete }: RentedTabProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Clock className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Нет активных аренд</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="glass-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-heading text-sm font-semibold">{order.equipmentName}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="text-xs">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{order.customerPhone}</span>
              </div>
            </div>
            <CountdownTimer endTime={order.endTime} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-3">
              <span>{order.totalPrice} ₽</span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {paymentLabels[order.paymentMethod]}
              </span>
            </div>
            <span>Залог: {order.deposit} ₽</span>
          </div>

          <Button
            onClick={() => onComplete(order.id)}
            size="sm"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Завершить
          </Button>
        </div>
      ))}
    </div>
  );
}

import { Clock } from 'lucide-react';
