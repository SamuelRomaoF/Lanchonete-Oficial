// Dados mockados de produtos para garantir que o site funcione
const mockProducts = [
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

exports.handler = async function(event, context) {
  console.log('==== INICIANDO FUNÇÃO getProducts ====');
  console.log('Query params:', event.queryStringParameters);
  console.log('Path:', event.path);
  
  // Verificar se a requisição é para produtos em destaque ou promoções
  const isFeatured = event.path.includes('featured') || event.queryStringParameters?.featured === 'true';
  const isPromotion = event.path.includes('promotions') || event.queryStringParameters?.promotion === 'true';
  const categoryId = event.queryStringParameters?.categoryId;
  
  // Filtrar produtos de acordo com os parâmetros
  let filteredProducts = [...mockProducts];
  
  if (isFeatured) {
    filteredProducts = filteredProducts.filter(product => product.isFeatured);
    console.log(`Filtrando produtos em destaque. Encontrados: ${filteredProducts.length}`);
  } else if (isPromotion) {
    filteredProducts = filteredProducts.filter(product => product.isPromotion);
    console.log(`Filtrando produtos em promoção. Encontrados: ${filteredProducts.length}`);
  } else if (categoryId) {
    filteredProducts = filteredProducts.filter(product => product.categoryId === parseInt(categoryId));
    console.log(`Filtrando produtos por categoria ${categoryId}. Encontrados: ${filteredProducts.length}`);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(filteredProducts)
  };
}; 