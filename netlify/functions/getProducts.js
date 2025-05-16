const axios = require('axios');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  try {
    // Buscar produtos do GitHub
    console.log('Buscando produtos do GitHub...');
    const url = getGithubFileUrl('data/products.json');
    console.log('URL:', url);
    
    try {
      const response = await axios.get(url, {
        headers: getGithubHeaders()
      });
      
      console.log('Produtos obtidos com sucesso');
      
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
            message: 'Inicializar produtos',
            content: Buffer.from(JSON.stringify([])).toString('base64')
          };
          
          await axios.put(
            url,
            createPayload,
            { headers: getGithubHeaders(false) }
          );
          
          console.log('Arquivo de produtos criado com sucesso');
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
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(produtosFallback)
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