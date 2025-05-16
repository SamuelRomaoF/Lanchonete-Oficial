const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

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
  if (!['POST', 'PUT', 'DELETE'].includes(event.httpMethod)) {
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
    
    // Verificar autorização (implementar caso necessário)
    // ...
    
    // Buscar categorias existentes
    let existingCategories = [];
    let sha = '';
    
    try {
      // Buscar o arquivo atual para obter o SHA e as categorias
      const fileResponse = await axios.get(
        getGithubFileUrl('data/categories.json'),
        {
          headers: getGithubHeaders(false) 
        }
      );
      
      const rawContent = await axios.get(
        getGithubFileUrl('data/categories.json'),
        {
          headers: getGithubHeaders(true) // Para obter o conteúdo
        }
      );
      
      sha = fileResponse.data.sha;
      existingCategories = typeof rawContent.data === 'string' 
        ? JSON.parse(rawContent.data) 
        : rawContent.data;
    } catch (error) {
      // Se o arquivo não existe, o sha permanece vazio e categories é array vazio
      if (error.response && error.response.status !== 404) {
        console.error('Erro ao buscar categorias existentes:', error);
        throw error;
      }
    }
    
    let updatedCategories = [...existingCategories];
    let message = '';
    
    // Tratar requisição com base no método
    if (event.httpMethod === 'POST') {
      // Adicionar nova categoria
      const newCategory = JSON.parse(event.body);
      
      // Gerar ID único (simulando auto-increment)
      const maxId = existingCategories.length > 0 
        ? Math.max(...existingCategories.map(c => c.id)) 
        : 0;
      
      newCategory.id = maxId + 1;
      
      updatedCategories.push(newCategory);
      message = 'Nova categoria criada';
      
      console.log('Nova categoria criada:', newCategory);
    } 
    else if (event.httpMethod === 'PUT') {
      // Atualizar categoria existente
      const updatedCategory = JSON.parse(event.body);
      const pathParts = event.path.split('/');
      const categoryId = parseInt(pathParts[pathParts.length - 1]);
      
      // Encontrar e atualizar a categoria
      const index = updatedCategories.findIndex(c => c.id === categoryId);
      
      if (index >= 0) {
        updatedCategories[index] = {
          ...updatedCategories[index],
          ...updatedCategory
        };
        message = `Categoria ${categoryId} atualizada`;
        console.log('Categoria atualizada:', updatedCategories[index]);
      } else {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Categoria não encontrada' })
        };
      }
    } 
    else if (event.httpMethod === 'DELETE') {
      // Excluir categoria
      const pathParts = event.path.split('/');
      const categoryId = parseInt(pathParts[pathParts.length - 1]);
      
      // Remover a categoria
      const initialLength = updatedCategories.length;
      updatedCategories = updatedCategories.filter(c => c.id !== categoryId);
      
      if (updatedCategories.length === initialLength) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Categoria não encontrada' })
        };
      }
      
      message = `Categoria ${categoryId} excluída`;
      console.log('Categoria excluída, ID:', categoryId);
    }
    
    // Configurar payload para a requisição
    const payload = {
      message: message || 'Atualização das categorias',
      content: Buffer.from(JSON.stringify(updatedCategories, null, 2)).toString('base64')
    };
    
    // Adicionar SHA se arquivo existir
    if (sha) {
      payload.sha = sha;
    }
    
    // Atualizar o arquivo usando os cabeçalhos padrão
    await axios.put(
      getGithubFileUrl('data/categories.json'),
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
      body: JSON.stringify({ 
        success: true, 
        message: message || 'Categorias atualizadas com sucesso',
        data: updatedCategories
      })
    };
  } catch (error) {
    console.error('Erro ao salvar categorias:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Falha ao salvar categorias', details: error.message })
    };
  }
}; 