import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  image?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/.netlify/functions/getCategories');
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar categorias: ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setError('Falha ao carregar categorias. Tente novamente.');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/.netlify/functions/saveCategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategories),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar categorias: ${response.status}`);
      }

      setCategories(updatedCategories);
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar categorias:', err);
      setError('Falha ao salvar categorias. Tente novamente.');
      return { success: false, error: 'Falha ao salvar categorias' };
    } finally {
      setIsLoading(false);
    }
  };

  return { categories, isLoading, error, saveCategories };
}
