import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/fetchApi';
import { Product } from '@shared/schema';

export const useProductsApi = () => {
  const queryClient = useQueryClient();

  // Adicionar um produto
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id'>) => {
      const response = await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidar a query para recarregar os produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Atualizar um produto
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const response = await fetchApi(`/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Deletar um produto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetchApi(`/products/${productId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    
    // Status das mutações
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
  };
}; 