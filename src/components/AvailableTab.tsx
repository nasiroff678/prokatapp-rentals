import { useState } from 'react';
import { Equipment, PaymentMethod } from '@/types/equipment';
import { OrderForm } from './OrderForm';
import { ArrowRight, CheckCircle, Zap, Archive, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface AvailableTabProps {
  equipment: Equipment[];
  onCreateOrder: (
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
  onMoveToWarehouse?: (id: string) => void;
}

export function AvailableTab({ equipment, onCreateOrder, onMoveToWarehouse }: AvailableTabProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedEquipment) {
    return (
      <OrderForm
        equipment={selectedEquipment}
        onSubmit={(eqId, name, phone, hours, deposit, payment, documentFile, totalPrice, startTime, endTime) => {
          onCreateOrder(eqId, name, phone, hours, deposit, payment, documentFile, totalPrice, startTime, endTime);
          setSelectedEquipment(null);
        }}
        onCancel={() => setSelectedEquipment(null)}
      />
    );
  }

  if (equipment.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-muted-foreground"
      >
        <div className="relative mb-4">
          <CheckCircle className="w-16 h-16 opacity-10" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary opacity-50" />
        </div>
        <p className="text-sm font-medium">Всё оборудование занято</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию или категории..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border/50 h-11 rounded-xl focus:ring-primary/20"
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
              staggerChildren: 0.05
            }
          }
        }}
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        ) : (
          filtered.map(item => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 }
          }}
          key={item.id}
          className="glass-card p-4 w-full flex items-center justify-between group relative overflow-hidden transition-all"
        >
          <div 
            className="relative z-10 flex items-center gap-4 flex-1 cursor-pointer" 
            onClick={() => setSelectedEquipment(item)}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold tracking-tight">{item.name}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {item.category} <span className="mx-1 text-primary/40">·</span> {item.pricePerHour} ₽/час
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2">
            {onMoveToWarehouse && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToWarehouse(item.id);
                }}
                className="h-8 w-8 text-muted-foreground hover:bg-foreground/5 hover:text-warning"
                title="Убрать на склад"
              >
                <Archive className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              onClick={() => setSelectedEquipment(item)}
              className="h-8 w-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Subtle gradient shine on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
