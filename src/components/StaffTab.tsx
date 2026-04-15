import { useState } from 'react';
import { Staff, useStaff, useAddStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  User, 
  Shield, 
  Pencil, 
  Trash2, 
  Users, 
  Key,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';

export function StaffTab() {
  const { data: staff = [], isLoading } = useStaff();
  const currentStaff = useAuthStore(state => state.currentStaff);
  const { mutate: addStaff } = useAddStaff();
  const { mutate: updateStaff } = useUpdateStaff();
  const { mutate: deleteStaff } = useDeleteStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [pin, setPin] = useState('');

  const resetForm = () => {
    setName('');
    setRole('staff');
    setPin('');
  };

  const handleAdd = () => {
    if (!name.trim() || !pin.trim()) return;
    if (pin.length !== 4) return;
    
    addStaff({ name: name.trim(), role, pin_code: pin });
    resetForm();
    setShowAdd(false);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setPin(s.pin_code);
  };

  const handleSaveEdit = () => {
    if (!editingStaff || !name.trim() || !pin.trim()) return;
    if (pin.length !== 4) return;

    updateStaff({ ...editingStaff, name: name.trim(), role, pin_code: pin });
    setEditingStaff(null);
    resetForm();
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-muted-foreground">
        <p className="animate-pulse">Загрузка сотрудников...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск сотрудников..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-white/5 h-11 rounded-xl focus:ring-primary/20"
          />
        </div>
        <Button
          onClick={() => { resetForm(); setShowAdd(true); }}
          variant="outline"
          className="border-dashed border-border text-primary gap-2 h-11 px-6 rounded-xl shrink-0 hover:bg-primary/5 hover:border-primary/30"
        >
          <Plus className="w-4 h-4" />
          Новый сотрудник
        </Button>
      </div>

      <div className="space-y-3">
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Сотрудники не найдены</p>
          </div>
        ) : (
          filteredStaff.map(s => (
            <div key={s.id} className="glass-card p-4 flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {s.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] uppercase font-bold tracking-tighter px-1.5 py-0.5 rounded ${s.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {s.role === 'admin' ? 'Администратор' : 'Сотрудник'}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Key className="w-2.5 h-2.5" />
                      {s.pin_code}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleOpenEdit(s)}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground dark:hover:text-white rounded-xl"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  disabled={s.id === currentStaff?.id}
                  onClick={() => {
                    if (window.confirm(`Удалить сотрудника ${s.name}?`)) {
                      deleteStaff(s.id);
                    }
                  }}
                  className={`h-9 w-9 rounded-xl ${s.id === currentStaff?.id ? 'opacity-20' : 'text-destructive hover:text-destructive/80 hover:bg-destructive/10'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Новый сотрудник
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">ФИО / Имя</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Например: Иван Иванов" 
                className="bg-secondary/50 border-white/5 h-11 rounded-xl" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Роль в системе</label>
              <Select value={role} onValueChange={(val: 'admin' | 'staff') => setRole(val)}>
                <SelectTrigger className="bg-secondary/50 border-white/5 h-11 rounded-xl">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-border border-white/10 rounded-xl">
                  <SelectItem value="admin">Администратор (Полный доступ)</SelectItem>
                  <SelectItem value="staff">Сотрудник (Только прокат)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">PIN-код (4 цифры)</label>
              <Input 
                type="text" 
                inputMode="numeric"
                maxLength={4}
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                placeholder="0000" 
                className="bg-secondary/50 border-white/5 h-11 rounded-xl text-center text-xl tracking-[0.5em] font-mono" 
              />
            </div>
            
            <Button 
              onClick={handleAdd} 
              disabled={!name.trim() || pin.length !== 4}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl mt-2 shadow-[0_4px_12px_rgba(20,185,129,0.3)]"
            >
              Добавить сотрудника
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Редактирование
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">ФИО / Имя</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-white/5 h-11 rounded-xl" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Роль</label>
              <Select value={role} onValueChange={(val: 'admin' | 'staff') => setRole(val)}>
                <SelectTrigger className="bg-secondary/50 border-white/5 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-border">
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="staff">Сотрудник</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">PIN-код</label>
              <Input 
                type="text" 
                maxLength={4}
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                className="bg-secondary/50 border-white/5 h-11 rounded-xl text-center text-xl tracking-[0.5em] font-mono" 
              />
            </div>
            
            <Button onClick={handleSaveEdit} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl mt-2">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
