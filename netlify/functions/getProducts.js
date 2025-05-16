const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  console.log('Iniciando getProducts...');
  try {
    // Buscar produtos do GitHub
    console.log('Solicitando produtos do GitHub...');
    
    const url = getGithubFileUrl('data/products.json');
    const headers = getGithubHeaders();
    
    console.log('URL:', url);
    console.log('Headers (parcial):', { 
      Accept: headers.Accept, 
      'User-Agent': headers['User-Agent'],
      'Authorization': headers.Authorization ? 'Token presente (omitido)' : 'Token ausente'
    });
    
    const response = await axios.get(url, { headers });
    
    console.log('Resposta recebida do GitHub com sucesso');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Resposta:', error.response.data);
    } else if (error.request) {
      console.error('Nenhuma resposta recebida, erro de conexão');
    } else {
      console.error('Erro na configuração da requisição');
    }
    
    // Se o arquivo não existir ainda (404), retorna array vazio
    if (error.response && error.response.status === 404) {
      console.log('Arquivo não encontrado, retornando array vazio');
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
      body: JSON.stringify({ error: 'Falha ao buscar produtos', details: error.message })
    };
  }
}; 