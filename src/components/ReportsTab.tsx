import { Order } from '@/types/equipment';
import { BarChart3, TrendingUp, DollarSign, Clock, Calendar, X, Search, Download, ListTodo, ShieldAlert, Package, User, Phone, CreditCard, Timer, Banknote, CheckCircle2, AlertCircle, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const { data: logs = [], isLoading: logsLoading } = useActionLogs();

  const stats = useMemo(() => {
    // Filter by period
    const filteredOrders = orders.filter(o => {
      if (period === 'all') return true;
      const date = parseISO(o.startTime || new Date().toISOString());
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
                    <span className="text-primary/70">{(log.staff as { name: string } | null)?.name || 'Система'}</span>
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
                 <button
                   key={o.id}
                   onClick={() => setSelectedOrder(o)}
                   className="glass-card p-3 flex flex-col gap-1 text-left w-full hover:bg-white/5 active:scale-[0.99] transition-all cursor-pointer"
                 >
                   <div className="flex justify-between items-start">
                     <p className="text-sm font-semibold">{o.equipmentName}</p>
                     <p className="font-heading text-primary font-bold">{o.totalPrice} ₽</p>
                   </div>
                   <p className="text-xs text-muted-foreground flex justify-between">
                     <span>{o.customerName} ({paymentLabels[o.paymentMethod]})</span>
                     <span>{format(new Date(o.startTime), 'dd.MM.yyyy HH:mm')}</span>
                   </p>
                 </button>
               ))
             )}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="glass-card w-full sm:max-w-md max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Заказ</p>
                <h2 className="font-heading text-lg font-bold leading-tight">{selectedOrder.equipmentName}</h2>
                <p className="text-[10px] text-muted-foreground mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedOrder.status === 'active' && (
                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-timer-warning/20 text-timer-warning border border-timer-warning/30 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Активный
                </span>
              )}
              {selectedOrder.status === 'completed' && (
                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Завершён
                </span>
              )}
              {selectedOrder.status === 'overdue' && (
                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-destructive/20 text-destructive border border-destructive/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Просрочен
                </span>
              )}
            </div>

            <div className="space-y-2">
              <DetailRow icon={User} label="Клиент" value={selectedOrder.customerName} />
              <DetailRow icon={Phone} label="Телефон" value={selectedOrder.customerPhone || '—'} />
              <DetailRow icon={Package} label="Оборудование" value={selectedOrder.equipmentName} />
              <DetailRow icon={Clock} label="Длительность" value={`${selectedOrder.rentalHours} ч`} />
              <DetailRow icon={Calendar} label="Начало" value={format(new Date(selectedOrder.startTime), 'dd.MM.yyyy HH:mm')} />
              <DetailRow icon={Calendar} label="Окончание" value={format(new Date(selectedOrder.endTime), 'dd.MM.yyyy HH:mm')} />
              <DetailRow icon={CreditCard} label="Оплата" value={paymentLabels[selectedOrder.paymentMethod]} />
              <DetailRow icon={DollarSign} label="Цена/час" value={`${selectedOrder.pricePerHour.toLocaleString()} ₽`} />
              <DetailRow icon={Banknote} label="Залог" value={`${selectedOrder.deposit.toLocaleString()} ₽`} />
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Итого</span>
              <span className="font-heading text-2xl font-bold text-primary">{selectedOrder.totalPrice.toLocaleString()} ₽</span>
            </div>

            {selectedOrder.documentImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Документ</p>
                  <button
                    onClick={() => setFullscreenImage(selectedOrder.documentImage!)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Открыть
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreenImage(selectedOrder.documentImage!)}
                  className="block w-full group relative"
                >
                  <img
                    src={selectedOrder.documentImage}
                    alt="Документ заказа"
                    className="w-full rounded-xl border border-white/10"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fullscreenImage && (
        <ImageZoomViewer src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </div>
  );
}

function ImageZoomViewer({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const reset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const zoomIn = () => setScale((s) => Math.min(s * 1.4, 6));
  const zoomOut = () => setScale((s) => Math.max(s / 1.4, 1));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setScale((s) => Math.min(Math.max(s + s * delta, 1), 6));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = pinchRef.current.scale * (dist / pinchRef.current.dist);
      setScale(Math.min(Math.max(next, 1), 6));
    }
  };
  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  const onDoubleClick = () => {
    if (scale > 1) reset();
    else setScale(2.5);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col touch-none select-none">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/60 backdrop-blur-sm">
        <span className="text-xs text-white/70 uppercase tracking-widest font-bold">
          Документ • {Math.round(scale * 100)}%
        </span>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-2 rounded-lg text-white hover:bg-white/10" title="Уменьшить">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={zoomIn} className="p-2 rounded-lg text-white hover:bg-white/10" title="Увеличить">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={reset} className="p-2 rounded-lg text-white hover:bg-white/10" title="Сбросить">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/10 ml-1" title="Закрыть">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden flex items-center justify-center"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={onDoubleClick}
        style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
      >
        <img
          src={src}
          alt="Документ"
          draggable={false}
          className="max-w-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            maxHeight: '90vh',
            maxWidth: '95vw',
          }}
        />
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
