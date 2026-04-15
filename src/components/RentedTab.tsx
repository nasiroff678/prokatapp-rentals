import { useState } from 'react';
import { Order } from '@/types/equipment';
import { CountdownTimer } from './CountdownTimer';
import { Phone, User, CreditCard, Clock, Activity, AlertCircle, Search, Inbox, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface RentedTabProps {
  orders: Order[];
  onComplete: (orderId: string, penaltyAmount?: number) => void;
  onExtend: (orderId: string, extraHours: number, addPrice: number) => void;
}

const paymentLabels: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Перевод',
};

export function RentedTab({ orders, onComplete, onExtend }: RentedTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [penalty, setPenalty] = useState<number>(0);
  
  const [extendingOrder, setExtendingOrder] = useState<Order | null>(null);
  const [extraHours, setExtraHours] = useState<number>(1);

  const filtered = orders.filter(o => 
    o.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerPhone.includes(searchQuery)
  );

  const handleCompleteDialog = (order: Order) => {
    setPenalty(0);
    setCompletingOrder(order);
  };

  const handleConfirmComplete = () => {
    if (completingOrder) {
      onComplete(completingOrder.id, penalty);
      setCompletingOrder(null);
    }
  };

  const handleConfirmExtend = () => {
    if (extendingOrder) {
      onExtend(extendingOrder.id, extraHours, extendingOrder.pricePerHour * extraHours);
      setExtendingOrder(null);
    }
  };

  const handleCopyOrder = (order: Order) => {
    const text = `РЕНТАЛ: ${order.equipmentName}\nКлиент: ${order.customerName}\nТел: ${order.customerPhone}\nВремя: ${format(new Date(order.startTime), 'HH:mm')} - ${format(new Date(order.plannedEndTime), 'HH:mm')}\nЗалог: ${order.deposit}₽\nК оплате: ${order.totalPrice}₽`;
    navigator.clipboard.writeText(text);
    toast.success('Детали заказа скопированы');
  };

  if (orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-muted-foreground"
      >
        <Clock className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-sm font-medium tracking-tight">Нет активных аренд</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по активным арендам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border/50 h-11 rounded-xl focus:ring-primary/20"
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="space-y-4"
      >
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        ) : (
          filtered.map(order => (
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 }
              }}
              key={order.id} 
              className="glass-card p-5 relative overflow-hidden group"
            >
          {/* Active indicator line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary neon-shadow" />
          
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                <h3 className="font-heading text-base font-semibold tracking-tight">{order.equipmentName}</h3>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{order.customerPhone}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <CountdownTimer startTime={order.startTime} endTime={order.endTime} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground mb-4 bg-foreground/5 p-3 rounded-xl border border-border/50">
            <div className="space-y-1">
              <p className="uppercase tracking-wider opacity-50">Оплата</p>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <CreditCard className="w-3 h-3 text-primary/70" />
                <span>{order.totalPrice} ₽ ({paymentLabels[order.paymentMethod]})</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-wider opacity-50">Залог</p>
              <p className="text-foreground font-medium">{order.deposit} ₽</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleCopyOrder(order)}
              size="sm"
              variant="outline"
              className="flex-1 bg-white/5 text-foreground border border-border hover:bg-white/10 transition-all duration-300 font-medium uppercase tracking-widest text-[10px] h-10 rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Детали
            </Button>
            <Button
              onClick={() => {
                setExtraHours(1);
                setExtendingOrder(order);
              }}
              size="sm"
              variant="outline"
              className="flex-1 bg-white/5 text-foreground border border-border hover:bg-white/10 transition-all duration-300 font-medium uppercase tracking-widest text-[10px] h-10 rounded-xl"
            >
              Продлить
            </Button>
            <Button
              onClick={() => handleCompleteDialog(order)}
              size="sm"
              className="flex-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-bold uppercase tracking-widest text-[10px] h-10 rounded-xl"
            >
              Завершить
            </Button>
          </div>
        </motion.div>
          ))
        )}
      </motion.div>

      <Dialog open={!!completingOrder} onOpenChange={(open) => !open && setCompletingOrder(null)}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>Завершение аренды</DialogTitle>
          </DialogHeader>
          {completingOrder && (
            <div className="space-y-4 py-4">
              <div className="glass-card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Оборудование:</span>
                  <span className="font-medium text-foreground">{completingOrder.equipmentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Клиент:</span>
                  <span className="font-medium text-foreground">{completingOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Залог:</span>
                  <span className="font-medium text-foreground">{completingOrder.deposit} ₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Удержать штраф (₽)
                </Label>
                <Input 
                  type="number" 
                  value={penalty} 
                  onChange={(e) => setPenalty(Number(e.target.value))} 
                  className="bg-secondary border-border"
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">К возврату клиенту</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  {Math.max(0, completingOrder.deposit - penalty)} ₽
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCompletingOrder(null)} className="flex-1 border-border">
              Отмена
            </Button>
            <Button onClick={handleConfirmComplete} className="flex-1 bg-primary text-primary-foreground">
              Подтвердить возврат
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Продление заказа Dialog */}
      <Dialog open={!!extendingOrder} onOpenChange={(open) => !open && setExtendingOrder(null)}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>Продление аренды</DialogTitle>
          </DialogHeader>
          {extendingOrder && (
            <div className="space-y-4 py-4">
              <div className="glass-card p-4 space-y-1">
                <p className="font-medium text-foreground">{extendingOrder.equipmentName}</p>
                <p className="text-xs text-muted-foreground">{extendingOrder.pricePerHour} ₽/час</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Дополнительное время (часов)</Label>
                <div className="flex items-center gap-2">
                  {[0.5, 1, 2, 3, 5].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setExtraHours(h)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        extraHours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      +{h === 0.5 ? '30м' : `${h}ч`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-foreground/5 border border-border/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">К доплате</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  {extendingOrder.pricePerHour * extraHours} ₽
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setExtendingOrder(null)} className="flex-1 border-border">
              Отмена
            </Button>
            <Button onClick={handleConfirmExtend} className="flex-1 bg-primary text-primary-foreground">
              Продлить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
