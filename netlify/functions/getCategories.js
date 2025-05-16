const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  console.log('==== INICIANDO FUNÇÃO getCategories ====');
  console.log('Token GitHub existe:', !!process.env.GITHUB_TOKEN);
  
  // Dados fallback para garantir que o site funcione
  const categoriasFallback = [
    { id: 1, name: "Lanches", description: "Sanduíches e lanches diversos" },
    { id: 2, name: "Bebidas", description: "Refrigerantes, sucos e água" },
    { id: 3, name: "Sobremesas", description: "Doces e sobremesas" },
    { id: 4, name: "Combos", description: "Combos promocionais" }
  ];
  
  try {
    console.log('Tentando obter categorias do GitHub...');
    const url = getGithubFileUrl('data/categories.json');
    console.log('URL:', url);
    
    try {
      // Obter categorias do GitHub
      const response = await axios.get(url, {
        headers: getGithubHeaders()
      });
      
      console.log('Categorias obtidas com sucesso do GitHub');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(response.data)
      };
    } catch (githubError) {
      console.error('Erro ao buscar categorias do GitHub:', githubError.message);
      
      // Se o arquivo não existir, tentar criar
      if (githubError.response && githubError.response.status === 404) {
        try {
          console.log('Arquivo de categorias não encontrado. Tentando criar...');
          const createPayload = {
            message: 'Inicializar categorias',
            content: Buffer.from(JSON.stringify(categoriasFallback)).toString('base64')
          };
          
          await axios.put(
            url,
            createPayload,
            { headers: getGithubHeaders(false) }
          );
          
          console.log('Arquivo de categorias criado com sucesso');
        } catch (createError) {
          console.error('Erro ao criar arquivo de categorias:', createError.message);
        }
      }
      
      // Retornar dados fallback
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(categoriasFallback)
      };
    }
  } catch (error) {
    console.error('Erro na função getCategories:', error);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(categoriasFallback)
    };
  }
}; 