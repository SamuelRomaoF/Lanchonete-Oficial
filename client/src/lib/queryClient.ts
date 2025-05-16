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
  
  // Substituir /api/ por /.netlify/functions/
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
  
  const res = await fetch(netlifyUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
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
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    
    // Converter URL para usar funções Netlify
    const url = queryKey[0] as string;
    const netlifyUrl = getNetlifyFunctionUrl(url);
    
    const res = await fetch(netlifyUrl, {
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
