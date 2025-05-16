import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Função para prefixar URLs de API com o prefixo Netlify Functions
function getNetlifyFunctionUrl(url: string): string {
  // Se a URL já começa com /.netlify, não modificar
  if (url.startsWith('/.netlify')) {
    return url;
  }
  
  // Mapeamento específico para cada endpoint
  if (url.startsWith('/api/categories')) {
    return '/.netlify/functions/getCategories';
  }
  
  if (url.startsWith('/api/products')) {
    return '/.netlify/functions/getProducts';
  }
  
  if (url.includes('/api/products/featured')) {
    return '/.netlify/functions/getProducts';
  }
  
  if (url.includes('/api/products/promotions')) {
    return '/.netlify/functions/getProducts';
  }
  
  // Para outros endpoints, fazer substituição padrão
  return url.replace('/api/', '/.netlify/functions/');
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
  
  // Converter URL para usar funções Netlify
  const netlifyUrl = getNetlifyFunctionUrl(url);
  
  try {
    const res = await fetch(netlifyUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      cache: 'no-cache' // Evitar problemas de cache
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Erro na requisição ${method} para ${netlifyUrl}:`, error);
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
    
    // Converter URL para usar funções Netlify
    const url = queryKey[0] as string;
    const netlifyUrl = getNetlifyFunctionUrl(url);
    
    try {
      console.log(`Iniciando requisição para ${netlifyUrl}`);
      
      const res = await fetch(netlifyUrl, {
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
      console.log(`Dados recebidos de ${netlifyUrl}:`, data);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${netlifyUrl}:`, error);
      
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
