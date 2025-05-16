import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, UploadIcon, FileSpreadsheetIcon, InfoIcon } from "lucide-react";
import { Category, Product, insertProductSchema, InsertProduct } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as XLSX from 'xlsx';
import { fetchApi } from "@/lib/fetchApi";

// Esquema para o formulário de produto
const productFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  oldPrice: z.coerce.number().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number({
    required_error: "Categoria é obrigatória",
  }),
  isFeatured: z.boolean().default(false),
  isPromotion: z.boolean().default(false),
  available: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductManagement = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Product>[]>([]);
  
  // Verificar se o usuário é administrador
  useEffect(() => {
    if (user && user.type !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user && user.type === "admin",
  });
  
  // Buscar produtos
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!user && user.type === "admin",
  });
  
  // Formulário para adicionar/editar produto
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      oldPrice: undefined,
      imageUrl: "",
      categoryId: undefined,
      isFeatured: false,
      isPromotion: false,
      available: true,
    },
  });
  
  // Atualizar valores do formulário quando editar um produto
  useEffect(() => {
    if (currentProduct && isEditDialogOpen) {
      form.reset({
        name: currentProduct.name,
        description: currentProduct.description || "",
        price: currentProduct.price,
        oldPrice: currentProduct.oldPrice || undefined,
        imageUrl: currentProduct.imageUrl || "",
        categoryId: currentProduct.categoryId || undefined,
        isFeatured: currentProduct.isFeatured || false,
        isPromotion: currentProduct.isPromotion || false,
        available: currentProduct.available !== false,
      });
    }
  }, [currentProduct, isEditDialogOpen, form]);
  
  // Mutation para adicionar produto
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: InsertProduct) => {
      return fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  // Mutation para excluir produto
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setCurrentProduct(null);
    },
    onError: (error) => {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Filtragem de produtos
  const filteredProducts = products?.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Funções de gerenciamento de produtos
  const handleCreateProduct = (data: ProductFormValues) => {
    addProductMutation.mutate(data);
  };
  
  const handleEditProduct = (data: ProductFormValues) => {
    if (currentProduct) {
      addProductMutation.mutate(data);
    }
  };
  
  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProductMutation.mutate(currentProduct.id);
    }
  };
  
  // Funções para abrir modais
  const openCreateDialog = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      oldPrice: undefined,
      imageUrl: "",
      categoryId: undefined,
      isFeatured: false,
      isPromotion: false,
      available: true,
    });
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  // Ajuda a encontrar o nome da categoria
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId || !categories) return "Sem categoria";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Desconhecida";
  };
  
  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setPreviewData([]);
    
    if (file) {
      // Processar o arquivo Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Verificar se existe uma aba de Produtos
          const isProductsSheet = workbook.SheetNames.includes("Produtos");
          
          if (isProductsSheet) {
            const worksheet = workbook.Sheets["Produtos"];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            // Mapear os dados para o formato do produto
            const products = jsonData.map((row, index) => ({
              id: index + 1, // Temporário para preview
              name: row.nome || row.name || '',
              description: row.descricao || row.description || '',
              price: parseFloat(row.preco || row.price || 0),
              categoryId: parseInt(row.categoria_id || row.categoryId || 1),
              imageUrl: row.imagem_url || row.imageUrl || '',
              isFeatured: (row.destaque || row.isFeatured || '').toString().toLowerCase() === 'sim' || 
                           (row.destaque || row.isFeatured || '').toString().toLowerCase() === 'true',
              isPromotion: (row.promocao || row.isPromotion || '').toString().toLowerCase() === 'sim' || 
                            (row.promocao || row.isPromotion || '').toString().toLowerCase() === 'true',
              oldPrice: parseFloat(row.preco_antigo || row.oldPrice || 0) || undefined,
              available: true
            }));
            
            setPreviewData(products);
            
            toast({
              title: "Arquivo processado",
              description: `${products.length} produtos encontrados no arquivo.`,
            });
          } else {
            // Se não encontrou a aba específica, tenta usar a primeira aba
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            // Verificar se os dados parecem ser de produtos (têm nome e preço)
            const isProductData = jsonData.length > 0 && 
              (jsonData[0].nome !== undefined || jsonData[0].name !== undefined) &&
              (jsonData[0].preco !== undefined || jsonData[0].price !== undefined);
            
            if (isProductData) {
              // Mapear os dados para o formato do produto
              const products = jsonData.map((row, index) => ({
                id: index + 1, // Temporário para preview
                name: row.nome || row.name || '',
                description: row.descricao || row.description || '',
                price: parseFloat(row.preco || row.price || 0),
                categoryId: parseInt(row.categoria_id || row.categoryId || 1),
                imageUrl: row.imagem_url || row.imageUrl || '',
                isFeatured: (row.destaque || row.isFeatured || '').toString().toLowerCase() === 'sim' || 
                            (row.destaque || row.isFeatured || '').toString().toLowerCase() === 'true',
                isPromotion: (row.promocao || row.isPromotion || '').toString().toLowerCase() === 'sim' || 
                              (row.promocao || row.isPromotion || '').toString().toLowerCase() === 'true',
                oldPrice: parseFloat(row.preco_antigo || row.oldPrice || 0) || undefined,
                available: true
              }));
              
              setPreviewData(products);
              
              toast({
                title: "Arquivo processado",
                description: `${products.length} produtos encontrados no arquivo.`,
              });
            } else {
              toast({
                title: "Formato incorreto",
                description: "O arquivo não contém dados de produtos reconhecíveis. Verifique a estrutura do arquivo.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          toast({
            title: "Erro ao processar arquivo",
            description: "O arquivo selecionado não está no formato esperado.",
            variant: "destructive",
          });
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  
  // Função para fazer upload do arquivo
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo Excel para fazer upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (previewData.length === 0) {
      toast({
        title: "Nenhum produto encontrado",
        description: "O arquivo não contém produtos válidos para importar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Processar cada produto
      const promises = previewData.map(async (product) => {
        try {
          if (!product.name || !product.price || !product.categoryId) {
            throw new Error("Dados obrigatórios faltando");
          }
          
          await addProductMutation.mutateAsync({
            name: product.name,
            description: product.description || null,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || null,
            isFeatured: product.isFeatured || false,
            isPromotion: product.isPromotion || false,
            oldPrice: product.oldPrice || null,
            available: true
          });
          
          return true;
        } catch (error) {
          console.error(`Erro ao adicionar produto ${product.name}:`, error);
          return false;
        }
      });
      
      // Executar todas as promessas
      const results = await Promise.allSettled(promises);
      
      // Contar sucessos e falhas
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const errorCount = results.length - successCount;
      
      toast({
        title: "Upload concluído",
        description: `${successCount} produtos importados com sucesso${errorCount > 0 ? `, ${errorCount} com falha` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      // Limpar formulário após upload
      setSelectedFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer o upload do arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Usar o template compartilhado do CategoryManagement
  const downloadTemplate = () => {
    // Redirecionar para a página de categorias que tem o download do template completo
    navigate("/admin/categorias");
    
    toast({
      title: "Redirecionando",
      description: "Você será redirecionado para a página de categorias para baixar o template completo.",
    });
  };
  
  if (!user || user.type !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Esta área é restrita a administradores.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Importar Produtos via Excel</CardTitle>
            <CardDescription>
              Faça o upload de um arquivo Excel (.xlsx) contendo seus produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <AlertTitle>Formato do Arquivo</AlertTitle>
              <AlertDescription>
                <p>Você pode fazer upload de um arquivo Excel com:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Uma aba chamada "Produtos" com as colunas:</li>
                  <ul className="list-circle pl-5 mt-1">
                    <li>nome (obrigatório)</li>
                    <li>descricao (opcional)</li>
                    <li>preco (obrigatório)</li>
                    <li>categoria_id (obrigatório) - relacionado ao ID da categoria</li>
                    <li>imagem_url (opcional)</li>
                    <li>destaque (sim/não, opcional)</li>
                    <li>promocao (sim/não, opcional)</li>
                    <li>preco_antigo (opcional)</li>
                  </ul>
                  <li className="mt-2">É recomendado primeiro importar categorias e depois produtos</li>
                  <li className="mt-2">Clique em "Baixar Template" para obter o arquivo de exemplo completo</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="fileInput"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {selectedFile ? selectedFile.name : "Clique para selecionar arquivo"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Suporta arquivos .xlsx, .xls e .csv
                    </p>
                  </label>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    Baixar Template
                  </Button>
                  
                  <Button 
                    disabled={!selectedFile || isUploading}
                    onClick={handleUpload}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {isUploading ? "Processando..." : "Importar Produtos"}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Pré-visualização</h3>
                {previewData.length > 0 ? (
                  <div className="border rounded-lg overflow-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">R$ {item.price !== undefined ? item.price.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.categoryId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-gray-500">
                    Selecione um arquivo para visualizar os dados
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductManagement;
