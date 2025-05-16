/**
 * Função para fazer requisições à API com tratamento de tokens de autenticação
 */
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  // Obter token do localStorage
  const token = localStorage.getItem('authToken');
  
  // Determinar a URL base
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  // Definir headers padrão
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Adicionar token de autenticação caso exista
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Fazer a requisição
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Verificar por erro na resposta
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || `Erro ${response.status}: ${response.statusText}`
    );
    throw error;
  }
  
  // Se a resposta for 204 (No Content), retorne null
  if (response.status === 204) {
    return null;
  }
  
  // Retornar a resposta como JSON
  return response.json();
}; 