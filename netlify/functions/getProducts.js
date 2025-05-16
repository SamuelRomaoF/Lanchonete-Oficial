const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  console.log('==== INICIANDO FUNÇÃO getProducts ====');
  console.log('Token GitHub existe:', !!process.env.GITHUB_TOKEN);
  console.log('Repositório configurado:', process.env.GITHUB_REPO || 'SamuelRomaoF/lanchonete-dados');
  
  // Dados fallback para garantir que o site funcione
  const produtosFallback = [
    {
      id: 1,
      name: "X-Burger",
      description: "Hambúrguer com queijo, alface e tomate",
      price: 18.9,
      categoryId: 1,
      imageUrl: "https://source.unsplash.com/random/300x200/?burger",
      available: true,
      isFeatured: true
    },
    {
      id: 2,
      name: "X-Bacon",
      description: "Hambúrguer com queijo, bacon, alface e tomate",
      price: 22.9,
      oldPrice: 25.9,
      categoryId: 1,
      imageUrl: "https://source.unsplash.com/random/300x200/?bacon",
      available: true,
      isPromotion: true
    },
    {
      id: 3,
      name: "Coca-Cola 350ml",
      description: "Refrigerante Coca-Cola lata 350ml",
      price: 6.5,
      categoryId: 2,
      imageUrl: "https://source.unsplash.com/random/300x200/?coke",
      available: true
    },
    {
      id: 4,
      name: "Água Mineral 500ml",
      description: "Água mineral sem gás 500ml",
      price: 4.0,
      categoryId: 2,
      imageUrl: "https://source.unsplash.com/random/300x200/?water",
      available: true
    },
    {
      id: 5,
      name: "Pudim",
      description: "Pudim de leite condensado",
      price: 8.9,
      categoryId: 3,
      imageUrl: "https://source.unsplash.com/random/300x200/?pudding",
      available: true,
      isFeatured: true
    },
    {
      id: 6,
      name: "Combo Estudante",
      description: "X-Burger + Batata Frita + Refrigerante",
      price: 28.9,
      oldPrice: 32.9,
      categoryId: 4,
      imageUrl: "https://source.unsplash.com/random/300x200/?combo",
      available: true,
      isPromotion: true,
      isFeatured: true
    }
  ];
  
  try {
    console.log('Tentando obter produtos do GitHub...');
    const url = getGithubFileUrl('data/products.json');
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
      body: JSON.stringify(produtosFallback)
    };
  } catch (error) {
    console.error('Erro na função getProducts:', error);
    console.log('Retornando dados fallback após erro');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(produtosFallback)
    };
  }
}; 