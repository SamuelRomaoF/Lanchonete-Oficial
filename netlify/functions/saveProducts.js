const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  // Verificar método HTTP
  if (event.httpMethod !== 'POST') {
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
    const products = JSON.parse(event.body);
    let sha = '';
    
    try {
      // Buscar o arquivo atual para obter o SHA
      const fileResponse = await axios.get(
        getGithubFileUrl('data/products.json'),
        {
          headers: getGithubHeaders(false) // Não precisamos do conteúdo raw, só do metadata
        }
      );
      sha = fileResponse.data.sha;
    } catch (error) {
      // Se o arquivo não existe, o sha permanece vazio (para criar novo arquivo)
      if (error.response && error.response.status !== 404) {
        throw error;
      }
    }
    
    // Configurar payload para a requisição
    const payload = {
      message: 'Atualização dos produtos',
      content: Buffer.from(JSON.stringify(products, null, 2)).toString('base64')
    };
    
    // Adicionar SHA se arquivo existir
    if (sha) {
      payload.sha = sha;
    }
    
    // Atualizar o arquivo usando os cabeçalhos padrão
    await axios.put(
      getGithubFileUrl('data/products.json'),
      payload,
      {
        headers: getGithubHeaders(false)
      }
    );
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, message: 'Produtos atualizados com sucesso' })
    };
  } catch (error) {
    console.error('Erro ao salvar produtos:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Falha ao salvar produtos', details: error.message })
    };
  }
}; 