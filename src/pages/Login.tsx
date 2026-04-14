import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function Login() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleComplete = async (value: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('pin_code', value)
        .single();

      if (error || !data) {
        toast.error('Неверный PIN-код');
        setPin(''); // Reset PIN on error
      } else {
        toast.success(`Добро пожаловать, ${data.name}!`);
        login(data);
        navigate('/');
      }
    } catch (e) {
      toast.error('Ошибка входа. Проверьте подключение.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grain p-4">
      <div className="glass-card p-8 rounded-3xl w-full max-w-sm flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            <span className="text-primary drop-shadow-[0_0_8px_rgba(20,185,129,0.5)]">PROKAT</span>APP
          </h1>
          <p className="text-muted-foreground">Введите 4-значный PIN-код</p>
        </div>

        <div className="flex justify-center w-full">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            onComplete={handleComplete}
            disabled={isLoading}
            autoFocus
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="w-14 h-14 text-2xl bg-secondary/50 border-border rounded-xl" />
              <InputOTPSlot index={1} className="w-14 h-14 text-2xl bg-secondary/50 border-border rounded-xl" />
              <InputOTPSlot index={2} className="w-14 h-14 text-2xl bg-secondary/50 border-border rounded-xl" />
              <InputOTPSlot index={3} className="w-14 h-14 text-2xl bg-secondary/50 border-border rounded-xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {isLoading && (
          <p className="text-sm text-primary animate-pulse">Проверка...</p>
        )}
      </div>
    </div>
  );
}
