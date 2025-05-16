const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  try {
    // Buscar categorias do GitHub
    console.log('Buscando categorias do GitHub...');
    const url = getGithubFileUrl('data/categories.json');
    console.log('URL:', url);
    
    try {
      const response = await axios.get(url, {
        headers: getGithubHeaders()
      });
      
      console.log('Categorias obtidas com sucesso');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(response.data)
      };
    } catch (githubError) {
      console.error('Erro ao buscar do GitHub:', githubError.message);
      
      // Se o arquivo não existir (404), criar um novo com array vazio
      if (githubError.response && githubError.response.status === 404) {
        console.log('Arquivo não encontrado. Retornando array vazio.');
        
        // Tentar criar o arquivo (para futuros acessos)
        try {
          const createPayload = {
            message: 'Inicializar categorias',
            content: Buffer.from(JSON.stringify([])).toString('base64')
          };
          
          await axios.put(
            url,
            createPayload,
            { headers: getGithubHeaders(false) }
          );
          
          console.log('Arquivo de categorias criado com sucesso');
        } catch (createError) {
          console.error('Erro ao criar arquivo:', createError.message);
        }
        
        // Retornar array vazio de qualquer forma
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify([])
        };
      }
      
      // Usar dados de fallback para situações de erro
      console.log('Retornando dados de fallback...');
      const categoriasFallback = [
        { id: 1, name: "Lanches", description: "Sanduíches e lanches diversos" },
        { id: 2, name: "Bebidas", description: "Refrigerantes, sucos e água" },
        { id: 3, name: "Sobremesas", description: "Doces e sobremesas" },
        { id: 4, name: "Combos", description: "Combos promocionais" }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(categoriasFallback)
      };
    }
  } catch (error) {
    console.error('Erro geral na função:', error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Falha ao processar a requisição', details: error.message })
    };
  }
}; 