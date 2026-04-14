import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment, Order, EquipmentStatus } from '@/types/equipment';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type DbEquipment = Database['public']['Tables']['equipment']['Row'];
type DbOrder = Database['public']['Tables']['orders']['Row'];

// Mapper functions
const mapEquipment = (data: DbEquipment): Equipment => ({
  id: data.id,
  name: data.name,
  category: data.category,
  status: data.status as EquipmentStatus,
  pricePerHour: data.price_per_hour,
  deposit: data.deposit,
  image: data.image_url || undefined,
});

const mapOrder = (data: DbOrder & { equipment?: { name: string } }): Order => ({
  id: data.id,
  equipmentId: data.equipment_id,
  equipmentName: data.equipment?.name || 'Неизвестно',
  customerName: data.customer_name,
  customerPhone: data.customer_phone,
  // We calculate rentalHours on the fly based on start and planned_end if needed, 
  // but for the UI we'll just mock it or calculate it.
  rentalHours: Math.round((new Date(data.planned_end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60 * 60)),
  pricePerHour: Math.round(data.total_price / Math.max(1, Math.round((new Date(data.planned_end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60 * 60)))),
  totalPrice: data.total_price,
  deposit: data.deposit,
  paymentMethod: data.payment_method as 'cash' | 'card' | 'transfer',
  startTime: data.start_time,
  endTime: data.planned_end_time,
  status: data.status as 'active' | 'completed' | 'overdue',
});

// Keys
export const keys = {
  equipment: ['equipment'] as const,
  orders: ['orders'] as const,
};

// --- EQUIPMENT HOOKS ---

export function useEquipment() {
  return useQuery({
    queryKey: keys.equipment,
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapEquipment);
    },
  });
}

export function useAddEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Omit<Equipment, 'id' | 'image' | 'status'> & { status?: EquipmentStatus; imageFile?: File }) => {
      let image_url = null;

      if (newItem.imageFile) {
        const fileExt = newItem.imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('equipment')
          .upload(fileName, newItem.imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('equipment')
          .getPublicUrl(fileName);

        image_url = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from('equipment').insert({
        name: newItem.name,
        category: newItem.category,
        price_per_hour: newItem.pricePerHour,
        deposit: newItem.deposit,
        status: newItem.status || 'warehouse',
        image_url,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.equipment });
      toast.success('Оборудование добавлено');
    },
    onError: (error) => toast.error('Ошибка добавления: ' + error.message),
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EquipmentStatus }) => {
      const { data, error } = await supabase.from('equipment').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.equipment });
    },
    onError: (error) => toast.error('Ошибка обновления статуса: ' + error.message),
  });
}

export function useEditEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedItem: { id: string; name: string; category: string; pricePerHour: number; deposit: number }) => {
      const { data, error } = await supabase.from('equipment').update({
        name: updatedItem.name,
        category: updatedItem.category,
        price_per_hour: updatedItem.pricePerHour,
        deposit: updatedItem.deposit,
      }).eq('id', updatedItem.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.equipment });
      toast.success('Оборудование успешно обновлено');
    },
    onError: (error) => toast.error('Ошибка при обновлении: ' + error.message),
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.equipment });
      toast.success('Оборудование удалено');
    },
    onError: (error) => toast.error('Ошибка при удалении: ' + error.message),
  });
}

// --- ORDER HOOKS ---

export function useOrders() {
  return useQuery({
    queryKey: keys.orders,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, equipment(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapOrder);
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const currentStaff = useAuthStore((state) => state.currentStaff);

  return useMutation({
    mutationFn: async (orderPayload: {
      equipmentId: string;
      customerName: string;
      customerPhone: string;
      rentalHours: number;
      pricePerHour: number;
      totalPrice: number;
      deposit: number;
      paymentMethod: string;
      documentFile?: File | undefined;
      startTime: string;
      endTime: string;
    }) => {
      const totalPrice = orderPayload.totalPrice;

      // 1. If there's a document file, upload it first
      let document_image_url = null;
      if (orderPayload.documentFile) {
        const fileExt = orderPayload.documentFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, orderPayload.documentFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        document_image_url = publicUrlData.publicUrl;
      }

      // Create order
      const { data: order, error } = await supabase.from('orders').insert({
        equipment_id: orderPayload.equipmentId,
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone,
        start_time: new Date(orderPayload.startTime).toISOString(),
        planned_end_time: new Date(orderPayload.endTime).toISOString(),
        total_price: totalPrice,
        deposit: orderPayload.deposit,
        payment_method: orderPayload.paymentMethod,
        operator_id: currentStaff?.id,
        status: 'active',
        document_image_url,
      }).select().single();

      if (error) throw error;

      // Update equipment status
      const { error: eqError } = await supabase.from('equipment').update({ status: 'rented' }).eq('id', orderPayload.equipmentId);
      if (eqError) throw eqError;

      // Create log
      await supabase.from('action_logs').insert({
        staff_id: currentStaff?.id,
        action_type: 'create_order',
        description: `Оформлен заказ на оборудование ID: ${orderPayload.equipmentId}`
      });

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.orders });
      queryClient.invalidateQueries({ queryKey: keys.equipment });
      toast.success('Заказ успешно оформлен');
    },
    onError: (error) => toast.error('Ошибка оформления заказа: ' + error.message),
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  const currentStaff = useAuthStore((state) => state.currentStaff);

  return useMutation({
    mutationFn: async ({ orderId, equipmentId, penaltyAmount = 0 }: { orderId: string; equipmentId: string; penaltyAmount?: number }) => {
      const now = new Date();
      
      const { error: orderError } = await supabase.from('orders').update({ 
        status: 'completed',
        actual_end_time: now.toISOString(),
        penalty_amount: penaltyAmount,
      }).eq('id', orderId);

      if (orderError) throw orderError;

      const { error: eqError } = await supabase.from('equipment').update({ status: 'available' }).eq('id', equipmentId);
      if (eqError) throw eqError;

       await supabase.from('action_logs').insert({
        staff_id: currentStaff?.id,
        action_type: 'complete_order',
        description: `Завершен заказ ID: ${orderId}${penaltyAmount > 0 ? ` со штрафом ${penaltyAmount} ₽` : ''}`
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.orders });
      queryClient.invalidateQueries({ queryKey: keys.equipment });
      toast.success('Заказ успешно завершен');
    },
    onError: (error) => toast.error('Ошибка завершения заказа: ' + error.message),
  });
}

export function useExtendOrder() {
  const queryClient = useQueryClient();
  const currentStaff = useAuthStore((state) => state.currentStaff);

  return useMutation({
    mutationFn: async ({ orderId, extraHours, addPrice }: { orderId: string; extraHours: number; addPrice: number }) => {
      // Get current order
      const { data: order, error: fetchError } = await supabase.from('orders').select('planned_end_time, total_price').eq('id', orderId).single();
      if (fetchError) throw fetchError;

      const newEndTime = new Date(new Date(order.planned_end_time).getTime() + extraHours * 60 * 60 * 1000);

      const { error: updateError } = await supabase.from('orders').update({
        planned_end_time: newEndTime.toISOString(),
        total_price: order.total_price + addPrice
      }).eq('id', orderId);

      if (updateError) throw updateError;

      await supabase.from('action_logs').insert({
        staff_id: currentStaff?.id,
        action_type: 'extend_order',
        description: `Продлен заказ ID: ${orderId} на ${extraHours} ч.`
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.orders });
      toast.success('Время аренды успешно продлено');
    },
    onError: (error) => toast.error('Ошибка при продлении: ' + error.message),
  });
}

export function useActionLogs() {
  return useQuery({
    queryKey: ['action_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_logs')
        .select(`
          *,
          staff (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

