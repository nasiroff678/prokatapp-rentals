import { Order } from '@/types/equipment';
import { BarChart3, TrendingUp, DollarSign, Clock, Calendar, X, Search, Download, ListTodo, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isToday, isThisMonth, parseISO, format } from 'date-fns';
import { useActionLogs } from '@/hooks/useSupabase';

interface ReportsTabProps {
  orders: Order[];
}

type Period = 'today' | 'month' | 'all';

export function ReportsTab({ orders }: ReportsTabProps) {
  const [reportTab, setReportTab] = useState<'stats' | 'logs'>('stats');
  const [period, setPeriod] = useState<Period>('today');
  const [showDetails, setShowDetails] = useState(false);
  const [detailSearch, setDetailSearch] = useState('');
  
  const { data: logs = [], isLoading: logsLoading } = useActionLogs();

  const stats = useMemo(() => {
    // Filter by period
    const filteredOrders = orders.filter(o => {
      if (period === 'all') return true;
      const date = parseISO(o.createdAt || new Date().toISOString());
      if (period === 'today') return isToday(date);
      if (period === 'month') return isThisMonth(date);
      return true;
    });

    const completed = filteredOrders.filter(o => o.status === 'completed');
    const active = filteredOrders.filter(o => o.status === 'active');
    const all = filteredOrders;

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
      filteredOrdersList: all,
    };
  }, [orders, period]);

  const statCards = [
    { label: 'Выручка', value: `${stats.totalRevenue.toLocaleString()} ₽`, icon: DollarSign, color: 'text-primary', onClick: () => setShowDetails(true) },
    { label: 'Заказов', value: stats.totalOrders, icon: TrendingUp, color: 'text-accent', onClick: () => setShowDetails(true) },
    { label: 'Активных', value: stats.activeOrders, icon: Clock, color: 'text-timer-warning' },
    { label: 'Ср. время', value: `${stats.avgHours} ч`, icon: BarChart3, color: 'text-muted-foreground' },
  ];

  const paymentLabels: Record<string, string> = { cash: 'Наличные', card: 'Карта', transfer: 'Перевод' };
  const maxPayment = Math.max(...Object.values(stats.paymentBreakdown), 1);

  const displayOrders = useMemo(() => {
    return stats.filteredOrdersList.filter(o => 
      o.equipmentName.toLowerCase().includes(detailSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(detailSearch.toLowerCase())
    );
  }, [stats.filteredOrdersList, detailSearch]);

  const exportToCSV = () => {
    const headers = ['Оборудование', 'Клиент', 'Телефон', 'Часы', 'Сумма', 'Дата'];
    const rows = stats.filteredOrdersList.map(o => [
      o.equipmentName,
      o.customerName,
      o.customerPhone,
      o.rentalHours,
      o.totalPrice,
      format(new Date(o.startTime), 'dd.MM.yyyy HH:mm')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${period}_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Toggle */}
      <div className="flex bg-secondary p-1 rounded-xl mb-2">
        <button
          onClick={() => setReportTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'stats' ? 'bg-primary/20 text-primary border border-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          СТАТИСТИКА
        </button>
        <button
          onClick={() => setReportTab('logs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'logs' ? 'bg-primary/20 text-primary border border-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          ЛОГИ ДЕЙСТВИЙ
        </button>
      </div>

      {reportTab === 'stats' ? (
        <>
          {/* Date Filter */}
      <div className="flex gap-2">
        <div className="flex flex-1 bg-secondary p-1 rounded-xl">
          {(['today', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'today' ? 'За сегодня' : p === 'month' ? 'За месяц' : 'За всё время'}
            </button>
          ))}
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center p-2 rounded-xl bg-secondary text-primary hover:bg-primary/20 transition-all border border-primary/10"
          title="Экспорт в CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, onClick }) => (
          <div 
            key={label} 
            className={`glass-card p-4 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors active:scale-95' : ''}`}
            onClick={onClick}
          >
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

        </>
      ) : (
        <div className="space-y-3">
          {logsLoading ? (
            <div className="py-20 text-center text-muted-foreground animate-pulse">Загрузка логов...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">Логов пока нет</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="glass-card p-4 flex gap-3 items-start border-l-2 border-l-primary/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">{log.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <span className="text-primary/70">{(log.staff as any)?.name || 'Система'}</span>
                    <span>•</span>
                    <span>{format(new Date(log.created_at), 'dd.MM HH:mm:ss')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex flex-col pb-20">
          <div className="p-4 space-y-3 border-b border-border shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold">Список заказов</h2>
              <button onClick={() => setShowDetails(false)} className="p-1 text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по названию или имени..."
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
             {displayOrders.length === 0 ? (
               <p className="text-center text-sm text-muted-foreground py-10">Ничего не найдено</p>
             ) : (
               displayOrders.map(o => (
                 <div key={o.id} className="glass-card p-3 flex flex-col gap-1">
                   <div className="flex justify-between items-start">
                     <p className="text-sm font-semibold">{o.equipmentName}</p>
                     <p className="font-heading text-primary font-bold">{o.totalPrice} ₽</p>
                   </div>
                   <p className="text-xs text-muted-foreground flex justify-between">
                     <span>{o.customerName} ({paymentLabels[o.paymentMethod]})</span>
                     <span>{format(new Date(o.startTime), 'dd.MM.yyyy HH:mm')}</span>
                   </p>
                 </div>
               ))
             )}
          </div>
        </div>
      )}
    </div>
  );
}
