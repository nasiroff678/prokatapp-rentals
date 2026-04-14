import { useState } from 'react';
import { Equipment, PaymentMethod } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OrderFormProps {
  equipment: Equipment;
  onSubmit: (
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
  ) => void;
  onCancel: () => void;
}

export function OrderForm({ equipment, onSubmit, onCancel }: OrderFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState(1);
  const [deposit, setDeposit] = useState(1000);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [documentFile, setDocumentFile] = useState<File | undefined>(undefined);
  const [customTotal, setCustomTotal] = useState<number | string | null>(null);

  const initialStart = new Date();
  const [startTime, setStartTime] = useState(format(initialStart, "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState(format(new Date(initialStart.getTime() + 1 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (!input) {
      setPhone('');
      return;
    }
    if (['7', '8', '9'].includes(input[0])) {
      if (input[0] === '9') input = '7' + input;
      else input = '7' + input.slice(1);
    } else {
      input = '7' + input;
    }

    let formatted = '+7';
    if (input.length > 1) formatted += ' (' + input.substring(1, 4);
    if (input.length >= 5) formatted += ') ' + input.substring(4, 7);
    if (input.length >= 8) formatted += '-' + input.substring(7, 9);
    if (input.length >= 10) formatted += '-' + input.substring(9, 11);
    
    setPhone(formatted);
  };

  const calculatedTotal = (hours === 0.5 && equipment.pricePerHour === 500) ? 300 : Math.round(equipment.pricePerHour * hours);
  const currentTotal = customTotal !== null ? customTotal : calculatedTotal;

  const isPriceAdjusted = hours === 0.5 && equipment.pricePerHour === 500 && customTotal === null;

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    if (!newStart) return;
    const end = new Date(new Date(newStart).getTime() + hours * 60 * 60 * 1000);
    setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndTime(newEnd);
    if (!newEnd || !startTime) return;
    const diffHours = (new Date(newEnd).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    setHours(diffHours > 0 ? Number(diffHours.toFixed(1)) : 0);
    setCustomTotal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !startTime || !endTime) return;
    const finalTotal = Number(currentTotal);
    onSubmit(equipment.id, name.trim(), phone.trim(), hours, deposit, payment, documentFile, finalTotal, startTime, endTime);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col">
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
          <Input 
            type="tel"
            value={phone} 
            onChange={handlePhoneChange} 
            placeholder="+7 (___) ___-__-__" 
            className="bg-secondary border-border" 
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Время аренды (часов)</Label>
          <div className="flex items-center gap-2">
            {[0.5, 1, 2, 3, 5].map(h => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHours(h);
                  if (startTime) {
                    const newEnd = new Date(new Date(startTime).getTime() + h * 60 * 60 * 1000);
                    setEndTime(format(newEnd, "yyyy-MM-dd'T'HH:mm"));
                  }
                  setCustomTotal(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  hours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {h === 0.5 ? '30м' : `${h}ч`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>Начало</Label>
            <Input 
              type="datetime-local" 
              value={startTime} 
              onChange={handleStartTimeChange} 
              className="bg-secondary border-border text-xs sm:text-sm px-2" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>Окончание</Label>
            <Input 
              type="datetime-local" 
              value={endTime} 
              onChange={handleEndTimeChange} 
              className="bg-secondary border-border text-xs sm:text-sm px-2" 
            />
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

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Фотография документа (Паспорт / Права)</Label>
          <Input type="file" accept="image/*" onChange={e => setDocumentFile(e.target.files?.[0])} className="bg-secondary border-border text-xs" />
        </div>

        <div className="glass-card p-3 flex items-center justify-between bg-white/10 border-primary/20 neon-shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Итого (₽)</span>
            {isPriceAdjusted && (
              <span className="text-[10px] text-primary/80 font-medium">Спец. цена 30м</span>
            )}
          </div>
          <Input 
            type="text"
            inputMode="numeric"
            value={currentTotal} 
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              setCustomTotal(val === '' ? '' : Number(val));
            }} 
            className="bg-secondary/80 border-primary/20 font-heading font-bold text-primary text-right max-w-[150px] text-xl h-12" 
          />
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
          Оформить <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
