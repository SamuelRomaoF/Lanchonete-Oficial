const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  try {
    // Verificar autenticação JWT
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Não autorizado' })
      };
    }
    
    // Buscar produtos para contar
    const productsResponse = await axios.get(
      getGithubFileUrl('data/products.json'),
      {
        headers: getGithubHeaders()
      }
    );
    
    // Contar produtos
    const productCount = productsResponse.data.length;
    
    // Buscar categorias
    const categoriesResponse = await axios.get(
      getGithubFileUrl('data/categories.json'),
      {
        headers: getGithubHeaders()
      }
    );
    
    // Contar categorias
    const categoryCount = categoriesResponse.data.length;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        productCount,
        categoryCount
      })
    };
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    
    // Resposta padrão em caso de erro
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Falha ao buscar estatísticas',
        productCount: 0,
        categoryCount: 0
      })
    };
  }
}; 