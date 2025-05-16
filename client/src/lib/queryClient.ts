import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Detectar ambiente automaticamente
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// URL base para o json-server em desenvolvimento ou API mockada em produção
const JSON_SERVER_URL = isLocalhost 
  ? "http://localhost:3001" 
  : "https://my-json-server.typicode.com/SamuelRomaoF/lanchonete-dados";

// Função para mapear URLs da API para o json-server
function getJsonServerUrl(url: string): string {
  // Mapear URLs para o json-server
  if (url.startsWith('/api/categories')) {
    // Para operações específicas com ID
    if (url.match(/\/api\/categories\/\d+/)) {
      const id = url.split('/').pop();
      return `${JSON_SERVER_URL}/categories/${id}`;
    }
    // Para listar todas as categorias
    return `${JSON_SERVER_URL}/categories`;
  }
  
  if (url.startsWith('/api/products')) {
    // Para produtos em destaque
    if (url.includes('/featured')) {
      return `${JSON_SERVER_URL}/products?isFeatured=true`;
    }
    // Para produtos em promoção
    if (url.includes('/promotions')) {
      return `${JSON_SERVER_URL}/products?isPromotion=true`;
    }
    // Para produtos por categoria
    if (url.includes('categoryId=')) {
      const categoryId = new URL(url, 'http://localhost').searchParams.get('categoryId');
      return `${JSON_SERVER_URL}/products?categoryId=${categoryId}`;
    }
    // Para um produto específico
    if (url.match(/\/api\/products\/\d+/)) {
      const id = url.split('/').pop();
      return `${JSON_SERVER_URL}/products/${id}`;
    }
    // Para listar todos os produtos
    return `${JSON_SERVER_URL}/products`;
  }
  
  // Caso genérico - remover /api/ e adicionar ao json-server
  return `${JSON_SERVER_URL}/${url.replace('/api/', '')}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Obter token de autenticação do localStorage
  const token = localStorage.getItem('auth_token');
  
  // Preparar cabeçalhos com autenticação se o token existir
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
  
  // Converter URL para usar o json-server
  const jsonServerUrl = getJsonServerUrl(url);
  
  console.log(`Enviando requisição ${method} para ${jsonServerUrl}`, data);
  
  try {
    const res = await fetch(jsonServerUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      cache: 'no-cache' // Evitar problemas de cache
    });

    console.log(`Resposta da requisição ${method} para ${jsonServerUrl}:`, res.status);
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Erro na requisição ${method} para ${jsonServerUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Obter token de autenticação do localStorage
    const token = localStorage.getItem('auth_token');
    
    // Preparar cabeçalhos com autenticação se o token existir
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, max-age=0',
      'Pragma': 'no-cache',
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    
    // Converter URL para usar json-server
    const url = queryKey[0] as string;
    const jsonServerUrl = getJsonServerUrl(url);
    
    try {
      console.log(`Iniciando requisição para ${jsonServerUrl}`);
      
      const res = await fetch(jsonServerUrl, {
        headers,
        cache: 'no-cache' // Desabilitar cache
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        // Se não ok, tentar obter mensagem de erro mas não lançar exceção
        const errorMessage = await res.text();
        console.error(`Erro na resposta (${res.status}): ${errorMessage}`);
        
        // Retornar um valor vazio em vez de lançar erro
        // Isso evita tela de erro para o usuário
        if (url.includes('categories')) return [];
        if (url.includes('products')) return [];
        return null;
      }
      
      const data = await res.json();
      console.log(`Dados recebidos de ${jsonServerUrl}:`, data);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${jsonServerUrl}:`, error);
      
      // Retornar dados vazios em vez de lançar erro
      if (url.includes('categories')) return [];
      if (url.includes('products')) return [];
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Mudança para returnNull
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Permitir uma tentativa de retry
    },
    mutations: {
      retry: false,
    },
  },
});
