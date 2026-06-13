import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qtyDescription: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isDrawerOpen: false,
  
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find((item) => item.id === newItem.id);
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isDrawerOpen: true, // Auto-open drawer when adding items
      };
    }
    return { 
      items: [...state.items, { ...newItem, quantity: 1 }],
      isDrawerOpen: true,
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity === 0 
      ? state.items.filter((item) => item.id !== id)
      : state.items.map((item) => item.id === id ? { ...item, quantity } : item)
  })),

  clearCart: () => set({ items: [] }),
  
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
}));
