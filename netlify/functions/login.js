const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    const { email, password } = JSON.parse(event.body);
    
    // Validar dados de entrada
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
      };
    }
    
    // Buscar arquivo de usuários do GitHub
    try {
      const response = await axios.get(
        getGithubFileUrl('data/users.json'),
        {
          headers: getGithubHeaders()
        }
      );
      
      const users = response.data;
      
      // Encontrar usuário pelo email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }
      
      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }
      
      // Criar objeto de usuário sem a senha
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      };
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, type: user.type },
        process.env.JWT_SECRET || 'seu_secret_temporario',
        { expiresIn: '7d' }
      );
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          user: userResponse,
          token
        })
      };
      
    } catch (error) {
      // Se o arquivo não existir, retornar erro de credenciais
      if (error.response && error.response.status === 404) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Erro ao realizar login' })
    };
  }
}; 