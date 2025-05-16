const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  console.log('==== INICIANDO FUNÇÃO getCategories ====');
  console.log('Token GitHub existe:', !!process.env.GITHUB_TOKEN);
  console.log('Repositório configurado:', process.env.GITHUB_REPO || 'SamuelRomaoF/lanchonete-dados');
  
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
    
    // Usar fallback enquanto debugamos
    console.log('Retornando dados fallback para garantir funcionamento');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(categoriasFallback)
    };
  } catch (error) {
    console.error('Erro na função getCategories:', error);
    console.log('Retornando dados fallback após erro');
    
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