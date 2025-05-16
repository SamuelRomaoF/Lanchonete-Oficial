import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadIcon, FileSpreadsheetIcon, InfoIcon } from "lucide-react";
import { Category, InsertCategory } from "@shared/schema";
import * as XLSX from 'xlsx';
import { fetchApi } from "@/lib/fetchApi";

// Componente para importação de categorias via Excel
const CategoryManagement = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation para adicionar categoria
  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: InsertCategory) => {
      return fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Category>[]>([]);
  
  // Verificar se o usuário é administrador
  if (user && user.type !== "admin") {
    navigate("/");
    return null;
  }
  
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
          
          // Verificar se existe uma aba de Categorias
          const isCategoriesSheet = workbook.SheetNames.includes("Categorias");
          
          if (isCategoriesSheet) {
            const worksheet = workbook.Sheets["Categorias"];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            // Mapear os dados para o formato da categoria
            const categories = jsonData.map((row, index) => ({
              id: index + 1, // Temporário para preview
              name: row.nome || row.name || '',
              description: row.descricao || row.description || '',
              imageUrl: row.imagem_url || row.imageUrl || ''
            }));
            
            setPreviewData(categories);
            
            toast({
              title: "Arquivo processado",
              description: `${categories.length} categorias encontradas no arquivo.`,
            });
          } else {
            // Se não encontrou a aba específica, tenta usar a primeira aba
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            
            // Verificar se os dados parecem ser de categorias (têm nome, mas não têm preço)
            const isCategoryData = jsonData.length > 0 && 
              (jsonData[0].nome !== undefined || jsonData[0].name !== undefined) &&
              jsonData[0].preco === undefined && 
              jsonData[0].price === undefined;
            
            if (isCategoryData) {
              // Mapear os dados para o formato da categoria
              const categories = jsonData.map((row, index) => ({
                id: index + 1, // Temporário para preview
                name: row.nome || row.name || '',
                description: row.descricao || row.description || '',
                imageUrl: row.imagem_url || row.imageUrl || ''
              }));
              
              setPreviewData(categories);
              
              toast({
                title: "Arquivo processado",
                description: `${categories.length} categorias encontradas no arquivo.`,
              });
            } else {
              toast({
                title: "Formato incorreto",
                description: "O arquivo não contém dados de categorias reconhecíveis. Verifique a estrutura do arquivo.",
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
        title: "Nenhuma categoria encontrada",
        description: "O arquivo não contém categorias válidas para importar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Processar cada categoria
      const promises = previewData.map(async (category) => {
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
        title: "Upload concluído",
        description: `${successCount} categorias importadas com sucesso${errorCount > 0 ? `, ${errorCount} com falha` : ''}`,
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
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorias");
    
    // Adicionar aba de produtos
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Produtos");
    
    // Gerar o arquivo e fazer download
    XLSX.writeFile(workbook, "template_completo.xlsx");
    
    toast({
      title: "Template baixado",
      description: "O template com abas para categorias e produtos foi baixado para sua pasta de downloads.",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <h1 className="text-2xl font-bold">Gerenciamento de Categorias</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Importar Categorias via Excel</CardTitle>
            <CardDescription>
              Faça o upload de um arquivo Excel (.xlsx) contendo suas categorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <AlertTitle>Formato do Arquivo</AlertTitle>
              <AlertDescription>
                <p>Você pode fazer upload de um arquivo Excel com:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Uma aba chamada "Categorias" com as colunas:</li>
                  <ul className="list-circle pl-5 mt-1">
                    <li>nome (obrigatório)</li>
                    <li>descricao (opcional)</li>
                    <li>imagem_url (opcional)</li>
                  </ul>
                  <li className="mt-2">E uma aba "Produtos" com as colunas:</li>
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
                  <li className="mt-2">Clique em "Baixar Template" para um exemplo completo</li>
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
                    {isUploading ? "Processando..." : "Importar Categorias"}
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description || '-'}</td>
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

export default CategoryManagement;