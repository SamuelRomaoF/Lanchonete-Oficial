import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image?: string;
  categoryId: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/.netlify/functions/getProducts');
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar produtos: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Falha ao carregar produtos. Tente novamente.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const saveProducts = async (updatedProducts: Product[]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/.netlify/functions/saveProducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProducts),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar produtos: ${response.status}`);
      }

      setProducts(updatedProducts);
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar produtos:', err);
      setError('Falha ao salvar produtos. Tente novamente.');
      return { success: false, error: 'Falha ao salvar produtos' };
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error, saveProducts };
} 