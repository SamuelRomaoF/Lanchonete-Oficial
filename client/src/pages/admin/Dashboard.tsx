import { useEffect, useState, ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  ShoppingBag, 
  Upload, 
  Package, 
  CreditCard, 
  FileSpreadsheet,
  Download,
  CheckCircle
} from "lucide-react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import * as XLSX from 'xlsx';

interface DashboardStats {
  productCount: number;
}

interface ExcelData {
  vendasDiarias: { name: string; vendas: number }[];
  totalVendas: number;
}

// Dados padrão para os gráficos (serão substituídos pelos da planilha)
const defaultSalesData = [
  { name: "Segunda", vendas: 0 },
  { name: "Terça", vendas: 0 },
  { name: "Quarta", vendas: 0 },
  { name: "Quinta", vendas: 0 },
  { name: "Sexta", vendas: 0 },
  { name: "Sábado", vendas: 0 },
  { name: "Domingo", vendas: 0 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const Dashboard = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [salesData, setSalesData] = useState(defaultSalesData);
  const [pieData, setPieData] = useState<{name: string; value: number}[]>([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [excelUploaded, setExcelUploaded] = useState(false);
  const { toast } = useToast();
  
  // Verificar se o usuário é administrador
  useEffect(() => {
    if (user && user.type !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
    enabled: !!user && user.type === "admin",
  });

  // Função para processar arquivo Excel
  const processExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        
        // Lendo a aba de vendas diárias
        const salesSheet = workbook.Sheets[workbook.SheetNames[0]];
        const vendasData = XLSX.utils.sheet_to_json<{Dia: string; Valor: number}>(salesSheet);
        
        // Calculando total de vendas da semana
        const totalVendas = vendasData.reduce((sum, row) => sum + row.Valor, 0);
        
        // Convertendo para o formato dos gráficos
        const newSalesData = vendasData.map(row => ({
          name: row.Dia,
          vendas: row.Valor
        }));
        
        setSalesData(newSalesData);
        setTotalVendas(totalVendas);
        setExcelUploaded(true);
        
        // Substituindo alert por toast
        toast({
          title: "Importação concluída",
          description: "Sua planilha foi importada com sucesso!",
          variant: "default",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
      } catch (error) {
        console.error("Erro ao processar planilha:", error);
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar a planilha. Verifique o formato e tente novamente.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsBinaryString(file);
  };
  
  // Função para obter categorias reais do sistema para o gráfico de pizza
  useEffect(() => {
    // Buscar categorias do sistema
    fetch('/api/categories')
      .then(res => res.json())
      .then(categories => {
        if (categories && categories.length > 0) {
          // Criar gráfico com categorias reais com valores padrão
          const categoryData = categories.map((cat: any, index: number) => ({
            name: cat.name,
            value: 100 / categories.length // Distribuição igual
          }));
          setPieData(categoryData);
        }
      })
      .catch(err => console.error('Erro ao carregar categorias:', err));
  }, []);
  
  // Função para criar e baixar um exemplo de planilha
  const downloadExcelExample = () => {
    const workbook = XLSX.utils.book_new();
    
    // Criando dados de exemplo para a aba de vendas
    const vendasData = [
      { Dia: "Segunda", Valor: 1200 },
      { Dia: "Terça", Valor: 1900 },
      { Dia: "Quarta", Valor: 1500 },
      { Dia: "Quinta", Valor: 2200 },
      { Dia: "Sexta", Valor: 2800 },
      { Dia: "Sábado", Valor: 3100 },
      { Dia: "Domingo", Valor: 2500 },
    ];
    
    // Adicionando a aba de vendas
    const vendasSheet = XLSX.utils.json_to_sheet(vendasData);
    XLSX.utils.book_append_sheet(workbook, vendasSheet, "Vendas");
    
    // Baixando o arquivo
    XLSX.writeFile(workbook, "dashboard_exemplo.xlsx");
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={downloadExcelExample}
          >
            <Download className="mr-2 h-4 w-4" /> Baixar Exemplo
          </Button>
          <Input
            type="file"
            accept=".xlsx,.xls"
            id="excel-upload"
            className="hidden"
            onChange={processExcel}
          />
          <label htmlFor="excel-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span><FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Planilha Excel</span>
            </Button>
          </label>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Vendas</p>
              <h3 className="text-2xl font-bold">
                {excelUploaded ? (
                  formatCurrency(totalVendas)
                ) : (
                  formatCurrency(0)
                )}
              </h3>
            </div>
            <div className="bg-primary/20 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Produtos</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats?.productCount || 0
                )}
              </h3>
            </div>
            <div className="bg-secondary/20 p-2 rounded-full">
              <Package className="h-5 w-5 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Como usar o Dashboard com Excel</h3>
        <p className="text-sm text-amber-700 mb-2">
          Para carregar seus dados de vendas, prepare uma planilha Excel com:
        </p>
        <div className="text-sm text-amber-700 mb-2">
          <strong>Colunas:</strong> "Dia" (Segunda, Terça, etc.) e "Valor" (ex: 1200, 1500, etc.)
        </div>
        <p className="text-sm text-amber-700">
          Clique em <strong>Baixar Exemplo</strong> para ver como sua planilha deve ser formatada.
        </p>
      </div>
      
      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas da Semana</CardTitle>
              <CardDescription>
                {excelUploaded ? 
                  "Dados importados da planilha Excel" :
                  "Importe uma planilha Excel para visualizar dados de vendas"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value as number)}`, "Vendas"]} 
                  />
                  <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Vendas por Categoria</CardTitle>
              <CardDescription>
                {excelUploaded ? 
                  "Dados importados da planilha Excel" :
                  "Distribuição com base nas categorias do sistema"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Porcentagem"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
