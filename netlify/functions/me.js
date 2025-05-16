const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getGithubFileUrl, getGithubHeaders } = require('./github-config');

exports.handler = async function(event, context) {
  try {
    // Verificar se o token está presente
    const token = event.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Token não fornecido' })
      };
    }
    
    // Verificar token (em uma implementação real, você usaria JWT com um secret seguro)
    try {
      // Este é um exemplo simplificado. Em produção, você deve usar um secret seguro armazenado nas variáveis de ambiente
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_temporario');
      
      // Buscar usuário do GitHub para verificar se ainda existe
      const response = await axios.get(
        getGithubFileUrl('data/users.json'),
        {
          headers: getGithubHeaders()
        }
      );
      
      const users = response.data;
      const user = users.find(u => u.id === decoded.id);
      
      if (!user) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Usuário não encontrado' })
        };
      }
      
      // Retornar dados do usuário sem a senha
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(userResponse)
      };
      
    } catch (error) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Token inválido' })
      };
    }
    
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Erro ao verificar usuário' })
    };
  }
}; 