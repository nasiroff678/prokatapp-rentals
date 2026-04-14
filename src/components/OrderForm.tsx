import { useState } from 'react';
import { Equipment, PaymentMethod } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, X } from 'lucide-react';

interface OrderFormProps {
  equipment: Equipment;
  onSubmit: (
    equipmentId: string,
    customerName: string,
    customerPhone: string,
    rentalHours: number,
    deposit: number,
    paymentMethod: PaymentMethod,
  ) => void;
  onCancel: () => void;
}

export function OrderForm({ equipment, onSubmit, onCancel }: OrderFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState(1);
  const [deposit, setDeposit] = useState(1000);
  const [payment, setPayment] = useState<PaymentMethod>('cash');

  const total = equipment.pricePerHour * hours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit(equipment.id, name.trim(), phone.trim(), hours, deposit, payment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-heading text-base font-semibold">Оформление</h2>
        <button onClick={onCancel} className="p-1 text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        <div className="glass-card p-3">
          <p className="font-heading text-sm font-semibold">{equipment.name}</p>
          <p className="text-xs text-muted-foreground">{equipment.pricePerHour} ₽/час</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">ФИО клиента</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Иванов Иван" className="bg-secondary border-border" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Телефон</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 123 4567" className="bg-secondary border-border" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Время аренды (часов)</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 5].map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {h}ч
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Залог (₽)</Label>
          <Input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="bg-secondary border-border" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Форма оплаты</Label>
          <div className="flex gap-2">
            {([['cash', 'Наличные'], ['card', 'Карта'], ['transfer', 'Перевод']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPayment(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  payment === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Итого</span>
          <span className="font-heading text-lg font-bold text-primary">{total} ₽</span>
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
          Оформить <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
