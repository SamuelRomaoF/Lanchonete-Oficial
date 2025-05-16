const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  try {
    // Buscar categorias do GitHub
    const response = await axios.get(
      getGithubFileUrl('data/categories.json'),
      {
        headers: getGithubHeaders()
      }
    );
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    
    // Se o arquivo não existir ainda (404), retorna array vazio
    if (error.response && error.response.status === 404) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify([])
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Falha ao buscar categorias', details: error.message })
    };
  }
}; 