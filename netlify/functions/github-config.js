/**
 * Configuração central para acesso ao repositório GitHub
 */
const axios = require('axios');

// Obter o nome do repositório da variável de ambiente ou usar o valor padrão
const githubRepo = process.env.GITHUB_REPO || 'SamuelRomaoF/lanchonete-dados';

// Base URL para acessar a API do GitHub
const baseApiUrl = `https://api.github.com/repos/${githubRepo}/contents`;

// Log para ajudar na depuração (será registrado nos logs do Netlify)
console.log(`Repositório configurado: ${githubRepo}`);
console.log(`Token GitHub existe: ${!!process.env.GITHUB_TOKEN}`);

/**
 * Retorna a URL completa para um arquivo no repositório
 * @param {string} path - Caminho do arquivo (ex: 'data/categories.json')
 * @returns {string} URL completa para a API do GitHub
 */
function getGithubFileUrl(path) {
  const url = `${baseApiUrl}/${path}`;
  console.log(`Acessando URL: ${url}`);
  return url;
}

/**
 * Retorna os cabeçalhos comuns para requisições à API do GitHub
 * @param {boolean} raw - Se true, inclui o cabeçalho para obter o conteúdo bruto
 * @returns {Object} Objeto com os cabeçalhos
 */
function getGithubHeaders(raw = true) {
  // Usando formato de autenticação mais recente (Bearer em vez de token)
  return {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': raw ? 'application/vnd.github.v3.raw' : 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Netlify-Function'
  };
}

/**
 * Inicializa um arquivo no repositório se não existir
 * @param {string} path - Caminho do arquivo (ex: 'data/categories.json')
 * @param {any} initialData - Dados iniciais (geralmente array vazio [])
 */
async function initializeFileIfNotExists(path, initialData = []) {
  try {
    // Tentar obter o arquivo
    await axios.get(getGithubFileUrl(path), {
      headers: getGithubHeaders()
    });
    
    // Se chegou aqui, o arquivo existe
    return true;
  } catch (error) {
    // Se o arquivo não existe (404), criar
    if (error.response && error.response.status === 404) {
      try {
        const payload = {
          message: `Inicializando ${path}`,
          content: Buffer.from(JSON.stringify(initialData, null, 2)).toString('base64')
        };
        
        await axios.put(
          getGithubFileUrl(path),
          payload,
          {
            headers: getGithubHeaders(false)
          }
        );
        
        return true;
      } catch (createError) {
        console.error(`Erro ao criar arquivo ${path}:`, createError);
        return false;
      }
    }
    
    console.error(`Erro ao verificar arquivo ${path}:`, error);
    return false;
  }
}

module.exports = {
  githubRepo,
  baseApiUrl,
  getGithubFileUrl,
  getGithubHeaders,
  initializeFileIfNotExists
}; 