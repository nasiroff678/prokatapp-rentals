import { useMemo, useState } from 'react';
import { Order } from '@/types/equipment';
import { format, isToday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Banknote, CreditCard, ArrowRightLeft, Receipt, Copy, CheckCircle2, Wallet, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';

interface ShiftTabProps {
  orders: Order[];
}

const paymentLabels: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Перевод',
};

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowRightLeft,
};

export function ShiftTab({ orders }: ShiftTabProps) {
  const currentStaff = useAuthStore(s => s.currentStaff);
  const [closed, setClosed] = useState(false);

  const todayOrders = useMemo(
    () => orders.filter(o => isToday(parseISO(o.startTime))),
    [orders]
  );

  const stats = useMemo(() => {
    const completed = todayOrders.filter(o => o.status === 'completed');
    const active = todayOrders.filter(o => o.status === 'active');
    const breakdown = { cash: 0, card: 0, transfer: 0 };
    todayOrders.forEach(o => { breakdown[o.paymentMethod] += o.totalPrice; });
    const total = breakdown.cash + breakdown.card + breakdown.transfer;
    const deposits = active.reduce((s, o) => s + o.deposit, 0);
    return { completed, active, breakdown, total, deposits };
  }, [todayOrders]);

  const handleCopy = () => {
    const date = format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ru });
    const lines = [
      `📋 СДАЧА СМЕНЫ`,
      `Дата: ${date}`,
      `Сотрудник: ${currentStaff?.name || '—'}`,
      ``,
      `Заказов всего: ${todayOrders.length}`,
      `  • Завершено: ${stats.completed.length}`,
      `  • В аренде: ${stats.active.length}`,
      ``,
      `💰 ВЫРУЧКА: ${stats.total.toLocaleString()} ₽`,
      `  • Наличные: ${stats.breakdown.cash.toLocaleString()} ₽`,
      `  • Карта:    ${stats.breakdown.card.toLocaleString()} ₽`,
      `  • Перевод:  ${stats.breakdown.transfer.toLocaleString()} ₽`,
      ``,
      `🔒 Залоги в обороте: ${stats.deposits.toLocaleString()} ₽`,
      ``,
      `К сдаче наличными: ${stats.breakdown.cash.toLocaleString()} ₽`,
    ].join('\n');
    navigator.clipboard.writeText(lines);
    toast.success('Отчёт скопирован — отправь администратору');
  };

  const handleClose = () => {
    handleCopy();
    setClosed(true);
    toast.success('Смена сдана ✓');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Текущая смена</span>
          <span className="text-[10px] text-primary font-bold">{format(new Date(), 'd MMM', { locale: ru })}</span>
        </div>
        <h2 className="font-heading text-2xl font-bold leading-tight">{currentStaff?.name}</h2>
        <p className="text-xs text-muted-foreground mt-1">Открыта в {format(new Date(), 'HH:mm')}</p>
      </div>

      {/* Total revenue card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Выручка за смену</span>
        </div>
        <p className="font-heading text-4xl font-bold text-primary drop-shadow-[0_0_12px_rgba(20,185,129,0.4)]">
          {stats.total.toLocaleString()} <span className="text-2xl">₽</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">{todayOrders.length} заказов · ✓ {stats.completed.length} · ⏱ {stats.active.length}</p>
      </motion.div>

      {/* Payment breakdown */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1">По способу оплаты</h3>
        {(['cash', 'card', 'transfer'] as const).map(key => {
          const Icon = paymentIcons[key];
          const value = stats.breakdown[key];
          const pct = stats.total > 0 ? (value / stats.total) * 100 : 0;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">{paymentLabels[key]}</span>
                </div>
                <span className="font-heading font-bold text-sm">{value.toLocaleString()} ₽</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden ml-10">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cash to hand over - highlighted */}
      <div className="glass-card p-5 border-warning/40 bg-warning/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1">К сдаче наличными</p>
            <p className="font-heading text-3xl font-bold text-warning">{stats.breakdown.cash.toLocaleString()} ₽</p>
          </div>
          <Banknote className="w-12 h-12 text-warning/30" />
        </div>
      </div>

      {stats.deposits > 0 && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Залоги в обороте</p>
            <p className="font-heading text-lg font-bold mt-1">{stats.deposits.toLocaleString()} ₽</p>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1 h-12 rounded-xl">
          <Copy className="w-4 h-4 mr-2" />
          Скопировать
        </Button>
        <Button
          onClick={handleClose}
          disabled={closed}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
        >
          {closed ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Сдано</> : <><Receipt className="w-4 h-4 mr-2" /> Сдать смену</>}
        </Button>
      </div>

      {todayOrders.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">Сегодня заказов пока нет</p>
      )}
    </div>
  );
}
