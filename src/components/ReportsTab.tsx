import { Order } from '@/types/equipment';
import { BarChart3, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface ReportsTabProps {
  orders: Order[];
}

export function ReportsTab({ orders }: ReportsTabProps) {
  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed');
    const active = orders.filter(o => o.status === 'active');
    const all = orders;

    const totalRevenue = all.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalDeposits = active.reduce((sum, o) => sum + o.deposit, 0);
    const avgHours = all.length > 0
      ? (all.reduce((sum, o) => sum + o.rentalHours, 0) / all.length).toFixed(1)
      : '0';

    // Top equipment
    const eqCount: Record<string, number> = {};
    all.forEach(o => {
      eqCount[o.equipmentName] = (eqCount[o.equipmentName] || 0) + 1;
    });
    const topEquipment = Object.entries(eqCount).sort((a, b) => b[1] - a[1])[0];

    // Payment breakdown
    const paymentBreakdown = { cash: 0, card: 0, transfer: 0 };
    all.forEach(o => {
      paymentBreakdown[o.paymentMethod] += o.totalPrice;
    });

    return {
      totalOrders: all.length,
      activeOrders: active.length,
      completedOrders: completed.length,
      totalRevenue,
      totalDeposits,
      avgHours,
      topEquipment: topEquipment ? `${topEquipment[0]} (${topEquipment[1]})` : '—',
      paymentBreakdown,
    };
  }, [orders]);

  const statCards = [
    { label: 'Выручка', value: `${stats.totalRevenue.toLocaleString()} ₽`, icon: DollarSign, color: 'text-primary' },
    { label: 'Заказов', value: stats.totalOrders, icon: TrendingUp, color: 'text-accent' },
    { label: 'Активных', value: stats.activeOrders, icon: Clock, color: 'text-timer-warning' },
    { label: 'Ср. время', value: `${stats.avgHours} ч`, icon: BarChart3, color: 'text-muted-foreground' },
  ];

  const paymentLabels: Record<string, string> = { cash: 'Наличные', card: 'Карта', transfer: 'Перевод' };
  const maxPayment = Math.max(...Object.values(stats.paymentBreakdown), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="font-heading text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <h3 className="font-heading text-xs text-muted-foreground mb-3">ТОП ОБОРУДОВАНИЕ</h3>
        <p className="text-sm font-medium">{stats.topEquipment}</p>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-heading text-xs text-muted-foreground mb-3">ПО СПОСОБУ ОПЛАТЫ</h3>
        <div className="space-y-3">
          {Object.entries(stats.paymentBreakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{paymentLabels[key]}</span>
                <span className="font-medium">{value.toLocaleString()} ₽</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(value / maxPayment) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.totalDeposits > 0 && (
        <div className="glass-card p-4">
          <h3 className="font-heading text-xs text-muted-foreground mb-1">ЗАЛОГИ В ОБОРОТЕ</h3>
          <p className="font-heading text-xl font-bold text-warning">{stats.totalDeposits.toLocaleString()} ₽</p>
        </div>
      )}
    </div>
  );
}
