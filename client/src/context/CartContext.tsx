import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[]; // Alias para cart para compatibilidade
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  openCart: () => void; // Função para abrir o carrinho no Navbar
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function useCart() {
  return useContext(CartContext);
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Carregar carrinho do localStorage ao iniciar
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  const addItem = (item: CartItem) => {
    setCart(currentCart => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = currentCart.findIndex(
        cartItem => cartItem.id === item.id
      );
      
      if (existingItemIndex >= 0) {
        // Se existir, incrementar a quantidade
        const updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Se não existir, adicionar ao carrinho
        return [...currentCart, item];
      }
    });
  };
  
  const updateItemQuantity = (id: number, quantity: number) => {
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const removeItem = (id: number) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  // Função para abrir o carrinho - na implementação real, 
  // isso poderia definir um estado no componente pai
  const openCart = () => {
    console.log("Abrir carrinho");
    // Na implementação real, isso setaria um estado no componente pai
  };
  
  const value = {
    cart,
    cartItems: cart, // Alias para compatibilidade
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    openCart,
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
