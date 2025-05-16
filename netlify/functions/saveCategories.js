// Dados estáticos de exemplo para categorias
const mockCategories = [
  {
    id: 1,
    name: "Lanches",
    description: "Hambúrgueres e sanduíches",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300"
  },
  {
    id: 2,
    name: "Bebidas",
    description: "Refrigerantes, sucos e milkshakes",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=300"
  },
  {
    id: 3,
    name: "Combos",
    description: "Combinações com desconto",
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=300"
  }
];

exports.handler = async function(event, context) {
  // Permitir CORS para requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  // Verificar método HTTP
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(event.httpMethod)) {
    return { 
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Método não permitido' }) 
    };
  }

  try {
    console.log('Recebida requisição:', event.httpMethod, event.path);
    
    // Para qualquer tipo de requisição, simplesmente retornamos os dados mockados
    // Em um ambiente real, aqui usaríamos uma solução persistente como DynamoDB ou FaunaDB
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: event.httpMethod === 'GET' 
        ? JSON.stringify(mockCategories)
        : JSON.stringify({ 
            success: true, 
            message: 'Operação simulada realizada com sucesso',
            data: mockCategories
          })
    };
  } catch (error) {
    console.error('Erro ao processar categorias:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Falha ao processar categorias', details: error.message })
    };
  }
}; 