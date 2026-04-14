import { useState } from 'react';
import { Equipment } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, Plus, Package } from 'lucide-react';

interface WarehouseTabProps {
  equipment: Equipment[];
  onMoveToAvailable: (id: string) => void;
  onAddEquipment: (name: string, category: string, pricePerHour: number) => void;
}

export function WarehouseTab({ equipment, onMoveToAvailable, onAddEquipment }: WarehouseTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState(300);

  const handleAdd = () => {
    if (!newName.trim() || !newCategory.trim()) return;
    onAddEquipment(newName.trim(), newCategory.trim(), newPrice);
    setNewName('');
    setNewCategory('');
    setNewPrice(300);
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setShowAdd(!showAdd)}
        variant="outline"
        className="w-full border-dashed border-border text-muted-foreground gap-2"
      >
        <Plus className="w-4 h-4" />
        Добавить оборудование
      </Button>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название" className="bg-secondary border-border" />
          <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Категория" className="bg-secondary border-border" />
          <Input type="number" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} placeholder="Цена/час" className="bg-secondary border-border" />
          <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">Добавить</Button>
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Склад пуст</p>
        </div>
      ) : (
        equipment.map(item => (
          <div key={item.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-semibold">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.pricePerHour} ₽/час</p>
            </div>
            <Button
              onClick={() => onMoveToAvailable(item.id)}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowUp className="w-3 h-3" />
              В прокат
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
