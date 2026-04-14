import { useState } from 'react';
import { Equipment } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, Plus, Package, QrCode, Printer, Pencil, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  'Велосипеды',
  'Электросамокаты',
  'Сноуборды',
  'Лыжи',
  'Туризм (Палатки)',
  'Инструменты',
  'Водный спорт (SUP)',
  'Другое'
];

interface WarehouseTabProps {
  equipment: Equipment[];
  onMoveToAvailable: (id: string) => void;
  onAddEquipment: (name: string, category: string, pricePerHour: number, deposit: number, imageFile?: File | undefined) => void;
  onEditEquipment: (id: string, name: string, category: string, pricePerHour: number, deposit: number) => void;
  onDeleteEquipment: (id: string) => void;
}

export function WarehouseTab({ equipment, onMoveToAvailable, onAddEquipment, onEditEquipment, onDeleteEquipment }: WarehouseTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDeposit, setNewDeposit] = useState<string>('');
  const [newFile, setNewFile] = useState<File | undefined>(undefined);

  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDeposit, setEditDeposit] = useState<string>('');

  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPrice(item.pricePerHour.toString());
    setEditDeposit((item.deposit ?? 1000).toString());
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    if (!editName.trim() || !editCategory.trim()) return;
    
    const price = Number(editPrice);
    const deposit = Number(editDeposit);
    
    if (isNaN(price) || price <= 0) return;
    
    onEditEquipment(editingItem.id, editName.trim(), editCategory.trim(), price, deposit);
    setEditingItem(null);
  };

  const handleAdd = () => {
    if (!newName.trim() || !newCategory.trim()) return;
    
    const price = Number(newPrice);
    const deposit = Number(newDeposit);
    
    if (isNaN(price) || price <= 0) return;
    
    onAddEquipment(newName.trim(), newCategory.trim(), price, deposit, newFile);
    
    setNewName('');
    setNewCategory('');
    setNewPrice('');
    setNewDeposit('');
    setNewFile(undefined);
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

      {/* Скрытый стиль для печати (показываем только QR при печати) */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-section, .print-section * { visibility: visible; }
            .print-section { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; }
          }
        `}
      </style>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название (например: SUP Board Gladiator)" className="bg-secondary border-border" />
          
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input 
            type="number" 
            value={newPrice} 
            onChange={e => setNewPrice(e.target.value)} 
            placeholder="Стоимость (₽/час)" 
            className="bg-secondary border-border" 
          />
          
          <Input 
            type="number" 
            value={newDeposit} 
            onChange={e => setNewDeposit(e.target.value)} 
            placeholder="Сумма залога (₽)" 
            className="bg-secondary border-border" 
          />
          
          <div className="text-sm">
            <label className="text-muted-foreground mb-1 block">Фотография (опционально)</label>
            <Input type="file" accept="image/*" onChange={e => setNewFile(e.target.files?.[0])} className="bg-secondary border-border text-xs" />
          </div>
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
          <Dialog key={item.id}>
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex-1 cursor-pointer">
                <h3 className="font-heading text-sm font-semibold">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.pricePerHour} ₽/час</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить это оборудование? Это действие необратимо.')) {
                      onDeleteEquipment(item.id);
                    }
                  }} 
                  className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-white">
                  <Pencil className="h-4 w-4" />
                </Button>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
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
            </div>

            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
              <DialogHeader>
                <DialogTitle>Инвентарный QR-код</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                <div className="print-section bg-white p-6 rounded-xl flex flex-col items-center gap-4">
                  <QRCodeSVG 
                    value={item.id} 
                    size={200}
                    level={"H"}
                    includeMargin={false}
                  />
                  <div className="text-center text-black font-sans">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-sm opacity-70">ID: {item.id.split('-')[0]}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.print()} 
                  className="w-full bg-primary text-primary-foreground gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Распечатать код
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>Редактирование оборудования</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Название</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Название" className="bg-secondary border-border" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Категория</label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Стоимость (₽/час)</label>
                <Input 
                  type="number" 
                  value={editPrice} 
                  onChange={e => setEditPrice(e.target.value)} 
                  placeholder="Стоимость" 
                  className="bg-secondary border-border" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Залог (₽)</label>
                <Input 
                  type="number" 
                  value={editDeposit} 
                  onChange={e => setEditDeposit(e.target.value)} 
                  placeholder="Залог" 
                  className="bg-secondary border-border" 
                />
              </div>
            </div>
            
            <Button onClick={handleSaveEdit} className="w-full bg-primary text-primary-foreground mt-4">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
