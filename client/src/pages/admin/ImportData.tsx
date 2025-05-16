import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadIcon, FileSpreadsheetIcon, InfoIcon, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetchApi";

// Tipo para categorias e produtos
type Category = {
  id?: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

type Product = {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  categoryId: number;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isPromotion?: boolean;
  oldPrice?: number | null;
  available?: boolean;
};

// Componente principal para importação de dados
const ImportData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [categoriesImported, setCategoriesImported] = useState(false);
  const [productsImported, setProductsImported] = useState(false);
  
  // Mutations
  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Category) => {
      return fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
  
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Product) => {
      return fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Baixar template de exemplo
  const downloadTemplate = () => {
    // Criar dados de exemplo para categorias
    const categoriesData = [
      { 
        nome: "Lanches", 
        descricao: "Hambúrgueres e sanduíches", 
        imagem_url: "https://example.com/lanches.jpg"
      },
      { 
        nome: "Bebidas", 
        descricao: "Refrigerantes, sucos e milk-shakes", 
        imagem_url: "https://example.com/bebidas.jpg"
      },
      { 
        nome: "Sobremesas", 
        descricao: "Doces e sobremesas", 
        imagem_url: "https://example.com/sobremesas.jpg"
      }
    ];
    
    // Criar dados de exemplo para produtos
    const productsData = [
      { 
        nome: "X-Burger", 
        descricao: "Hambúrguer com queijo", 
        preco: 18.90, 
        categoria_id: 1,
        imagem_url: "https://example.com/x-burger.jpg",
        destaque: "sim",
        promocao: "não",
        preco_antigo: 22.00
      },
      { 
        nome: "X-Bacon", 
        descricao: "Hambúrguer com bacon e queijo", 
        preco: 22.90, 
        categoria_id: 1,
        imagem_url: "https://example.com/x-bacon.jpg",
        destaque: "não",
        promocao: "sim",
        preco_antigo: 25.90
      },
      { 
        nome: "Refrigerante Cola", 
        descricao: "Lata 350ml", 
        preco: 5.00, 
        categoria_id: 2,
        imagem_url: "https://example.com/refrigerante.jpg",
        destaque: "não",
        promocao: "não"
      },
      { 
        nome: "Milk Shake", 
        descricao: "Chocolate 400ml", 
        preco: 12.00, 
        categoria_id: 2,
        imagem_url: "https://example.com/milkshake.jpg",
        destaque: "sim",
        promocao: "não"
      }
    ];
    
    // Criar planilha com duas abas
    const workbook = XLSX.utils.book_new();
    
    // Adicionar aba de categorias
    const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
    
    // Configurar largura das colunas para categorias
    const categoriesColWidth = [
      {wch: 15},  // nome - A
      {wch: 30},  // descricao - B
      {wch: 40}   // imagem_url - C
    ];
    categoriesSheet['!cols'] = categoriesColWidth;
    
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorias");
    
    // Adicionar aba de produtos
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    
    // Configurar largura das colunas para produtos
    const productsColWidth = [
      {wch: 20},  // nome - A
      {wch: 35},  // descricao - B
      {wch: 10},  // preco - C
      {wch: 12},  // categoria_id - D
      {wch: 40},  // imagem_url - E
      {wch: 10},  // destaque - F
      {wch: 10},  // promocao - G
      {wch: 12}   // preco_antigo - H
    ];
    productsSheet['!cols'] = productsColWidth;
    
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Produtos");
    
    // Gerar o arquivo e fazer download
    XLSX.writeFile(workbook, "template_completo.xlsx");
    
    toast({
      title: "Template baixado",
      description: "O template com categorias e produtos foi baixado para sua pasta de downloads.",
    });
  };
  
  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setCategoriesData([]);
    setProductsData([]);
    setCategoriesImported(false);
    setProductsImported(false);
    
    if (file) {
      // Processar o arquivo Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Processar categorias
          if (workbook.SheetNames.includes("Categorias")) {
            const worksheet = workbook.Sheets["Categorias"];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            // Mapear os dados para o formato de categoria
            const categories = jsonData.map((row, index) => ({
              id: index + 1, // Temporário para preview
              name: row.nome || row.name || '',
              description: row.descricao || row.description || '',
              imageUrl: row.imagem_url || row.imageUrl || ''
            }));
            
            setCategoriesData(categories);
            
            toast({
              title: "Categorias encontradas",
              description: `${categories.length} categorias encontradas no arquivo.`,
            });
          }
          
          // Processar produtos
          if (workbook.SheetNames.includes("Produtos")) {
            const worksheet = workbook.Sheets["Produtos"];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            console.log("Dados brutos dos produtos:", jsonData);
            
            // Mapear os dados para o formato de produto
            const products = jsonData.map((row, index) => {
              console.log(`Processando produto #${index+1}:`, row);
              
              // Converter valores de destaque e promoção para booleanos
              const destaqueValue = String(row.destaque || row.isFeatured || '').trim().toLowerCase();
              const promocaoValue = String(row.promocao || row.isPromotion || '').trim().toLowerCase();
              
              console.log(`Produto #${index+1} - destaque:`, destaqueValue, "promocao:", promocaoValue);
              
              const isFeatured = destaqueValue === 'sim' || destaqueValue === 'true' || destaqueValue === '1';
              const isPromotion = promocaoValue === 'sim' || promocaoValue === 'true' || promocaoValue === '1';
              
              console.log(`Produto #${index+1} - isFeatured:`, isFeatured, "isPromotion:", isPromotion);
              
              const produto = {
                id: index + 1, // Temporário para preview
                name: row.nome || row.name || '',
                description: row.descricao || row.description || '',
                price: parseFloat(String(row.preco || row.price || 0).replace(',', '.')),
                categoryId: parseInt(String(row.categoria_id || row.categoryId || 1)),
                imageUrl: row.imagem_url || row.imageUrl || '',
                isFeatured: isFeatured,
                isPromotion: isPromotion,
                oldPrice: row.preco_antigo || row.oldPrice ? parseFloat(String(row.preco_antigo || row.oldPrice).replace(',', '.')) : undefined,
                available: true
              };
              
              console.log(`Produto processado #${index+1}:`, produto);
              return produto;
            });
            
            setProductsData(products);
            
            toast({
              title: "Produtos encontrados",
              description: `${products.length} produtos encontrados no arquivo.`,
            });
          }
          
          // Se não encontrou nenhuma das abas
          if (!workbook.SheetNames.includes("Categorias") && !workbook.SheetNames.includes("Produtos")) {
            toast({
              title: "Formato incorreto",
              description: "O arquivo não contém as abas esperadas (Categorias e/ou Produtos).",
              variant: "destructive",
            });
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
  
  // Importar categorias
  const handleImportCategories = async () => {
    if (categoriesData.length === 0) {
      toast({
        title: "Nenhuma categoria encontrada",
        description: "O arquivo não contém categorias válidas para importar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Processar cada categoria
      const promises = categoriesData.map(async (category) => {
        try {
          if (!category.name) {
            throw new Error("Nome da categoria é obrigatório");
          }
          
          await addCategoryMutation.mutateAsync({
            name: category.name,
            description: category.description || null,
            imageUrl: category.imageUrl || null
          });
          
          return true;
        } catch (error) {
          console.error(`Erro ao adicionar categoria ${category.name}:`, error);
          return false;
        }
      });
      
      // Executar todas as promessas
      const results = await Promise.allSettled(promises);
      
      // Contar sucessos e falhas
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const errorCount = results.length - successCount;
      
      toast({
        title: "Categorias importadas",
        description: `${successCount} categorias importadas com sucesso${errorCount > 0 ? `, ${errorCount} com falha` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      setCategoriesImported(true);
    } catch (error) {
      console.error("Erro ao importar categorias:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar as categorias. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Importar produtos
  const handleImportProducts = async () => {
    if (productsData.length === 0) {
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
      const promises = productsData.map(async (product) => {
        try {
          if (!product.name || !product.price || !product.categoryId) {
            throw new Error("Dados obrigatórios faltando");
          }
          
          console.log("Enviando produto para o servidor:", {
            name: product.name,
            description: product.description || null,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || null,
            isFeatured: Boolean(product.isFeatured),
            isPromotion: Boolean(product.isPromotion),
            oldPrice: product.oldPrice || null,
            available: true
          });
          
          await addProductMutation.mutateAsync({
            name: product.name,
            description: product.description || null,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || null,
            isFeatured: Boolean(product.isFeatured),
            isPromotion: Boolean(product.isPromotion),
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
        title: "Produtos importados",
        description: `${successCount} produtos importados com sucesso${errorCount > 0 ? `, ${errorCount} com falha` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      setProductsImported(true);
    } catch (error) {
      console.error("Erro ao importar produtos:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os produtos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Importar tudo
  const handleImportAll = async () => {
    if (categoriesData.length === 0 && productsData.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "O arquivo não contém dados válidos para importar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Primeiro importar categorias, depois produtos
    if (categoriesData.length > 0) {
      await handleImportCategories();
    }
    
    if (productsData.length > 0) {
      await handleImportProducts();
    }
    
    setIsUploading(false);
    
    toast({
      title: "Importação concluída",
      description: "Todos os dados foram importados com sucesso!",
    });
  };

  // Renderizar tabela de prévia de categorias
  const renderCategoriesPreview = () => {
    if (categoriesData.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Prévia de Categorias</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL da Imagem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoriesData.slice(0, 5).map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.imageUrl}</td>
                </tr>
              ))}
              {categoriesData.length > 5 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    ... e mais {categoriesData.length - 5} categorias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Renderizar tabela de prévia de produtos
  const renderProductsPreview = () => {
    if (productsData.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Prévia de Produtos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promoção</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData.slice(0, 5).map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoryId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.isFeatured ? 'Sim' : 'Não'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.isPromotion ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
              {productsData.length > 5 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    ... e mais {productsData.length - 5} produtos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Importação de Dados</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Importar Categorias e Produtos via Excel</CardTitle>
          <CardDescription>
            Faça o upload de um único arquivo Excel (.xlsx) contendo suas categorias e produtos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-5 w-5 text-blue-500" />
            <AlertTitle>Formato do Arquivo</AlertTitle>
            <AlertDescription>
              <p>O arquivo Excel deve conter duas abas:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Uma aba chamada "Categorias" com as colunas:</li>
                <ul className="list-circle pl-5 mt-1">
                  <li>nome (obrigatório)</li>
                  <li>descricao (opcional)</li>
                  <li>imagem_url (opcional)</li>
                </ul>
                <li className="mt-2">Uma aba chamada "Produtos" com as colunas:</li>
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
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx, .xls"
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
                Suporta arquivos .xlsx e .xls
              </p>
            </label>
          </div>
          
          {/* Prévia dos dados */}
          {renderCategoriesPreview()}
          {renderProductsPreview()}
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FileSpreadsheetIcon className="h-4 w-4" />
              Baixar Template
            </Button>
            
            <div className="space-x-2">
              {categoriesData.length > 0 && (
                <Button 
                  disabled={isUploading || categoriesImported}
                  onClick={handleImportCategories}
                  variant={categoriesImported ? "outline" : "default"}
                  className={`${categoriesImported ? "bg-green-50 text-green-600 border-green-200" : ""}`}
                >
                  {categoriesImported ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Categorias Importadas
                    </>
                  ) : (
                    isUploading ? "Processando..." : "Importar Categorias"
                  )}
                </Button>
              )}
              
              {productsData.length > 0 && (
                <Button 
                  disabled={isUploading || productsImported}
                  onClick={handleImportProducts}
                  variant={productsImported ? "outline" : "default"}
                  className={`${productsImported ? "bg-green-50 text-green-600 border-green-200" : ""}`}
                >
                  {productsImported ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Produtos Importados
                    </>
                  ) : (
                    isUploading ? "Processando..." : "Importar Produtos"
                  )}
                </Button>
              )}
              
              {(categoriesData.length > 0 || productsData.length > 0) && (
                <Button 
                  disabled={isUploading || (categoriesImported && productsImported)}
                  onClick={handleImportAll}
                  variant="default"
                >
                  {isUploading ? "Processando..." : "Importar Tudo"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;