import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { InsertCategory, InsertProduct, InsertUser, InsertOrder, InsertOrderItem, InsertPayment } from '@shared/schema';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos para os arquivos JSON
const STORAGE_DIR = path.join(__dirname, 'json_data');
const CATEGORIES_FILE = path.join(STORAGE_DIR, 'categories.json');
const PRODUCTS_FILE = path.join(STORAGE_DIR, 'products.json');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');
const ORDERS_FILE = path.join(STORAGE_DIR, 'orders.json');

// Funções auxiliares para ler e escrever arquivos JSON
async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, cria um diretório e retorna um objeto vazio
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      return {} as T;
    }
    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  // Garante que o diretório existe
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Funções para gerenciar categorias
export async function getCategories() {
  const data = await readJsonFile<{ categories: any[] }>(CATEGORIES_FILE);
  return data.categories || [];
}

export async function getCategory(id: number) {
  const categories = await getCategories();
  return categories.find(category => category.id === id);
}

export async function createCategory(categoryData: InsertCategory) {
  const data = await readJsonFile<{ categories: any[] }>(CATEGORIES_FILE);
  const categories = data.categories || [];
  
  // Gerar novo ID
  const id = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
  
  const newCategory = {
    id,
    ...categoryData
  };
  
  categories.push(newCategory);
  
  await writeJsonFile(CATEGORIES_FILE, { categories });
  
  return newCategory;
}

export async function updateCategory(id: number, categoryData: Partial<InsertCategory>) {
  const data = await readJsonFile<{ categories: any[] }>(CATEGORIES_FILE);
  let categories = data.categories || [];
  
  const index = categories.findIndex(category => category.id === id);
  
  if (index === -1) {
    return null;
  }
  
  categories[index] = {
    ...categories[index],
    ...categoryData
  };
  
  await writeJsonFile(CATEGORIES_FILE, { categories });
  
  return categories[index];
}

export async function deleteCategory(id: number) {
  const data = await readJsonFile<{ categories: any[] }>(CATEGORIES_FILE);
  let categories = data.categories || [];
  
  const index = categories.findIndex(category => category.id === id);
  
  if (index === -1) {
    return false;
  }
  
  categories.splice(index, 1);
  
  await writeJsonFile(CATEGORIES_FILE, { categories });
  
  return true;
}

// Funções para gerenciar produtos
export async function getProducts() {
  const data = await readJsonFile<{ products: any[] }>(PRODUCTS_FILE);
  return data.products || [];
}

export async function getProduct(id: number) {
  const products = await getProducts();
  return products.find(product => product.id === id);
}

export async function getProductsByCategory(categoryId: number) {
  const products = await getProducts();
  return products.filter(product => product.categoryId === categoryId);
}

export async function createProduct(productData: InsertProduct) {
  const data = await readJsonFile<{ products: any[] }>(PRODUCTS_FILE);
  const products = data.products || [];
  
  // Gerar novo ID
  const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  
  const newProduct = {
    id,
    ...productData,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  await writeJsonFile(PRODUCTS_FILE, { products });
  
  return newProduct;
}

export async function updateProduct(id: number, productData: Partial<InsertProduct>) {
  const data = await readJsonFile<{ products: any[] }>(PRODUCTS_FILE);
  let products = data.products || [];
  
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) {
    return null;
  }
  
  products[index] = {
    ...products[index],
    ...productData
  };
  
  await writeJsonFile(PRODUCTS_FILE, { products });
  
  return products[index];
}

export async function deleteProduct(id: number) {
  const data = await readJsonFile<{ products: any[] }>(PRODUCTS_FILE);
  let products = data.products || [];
  
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) {
    return false;
  }
  
  products.splice(index, 1);
  
  await writeJsonFile(PRODUCTS_FILE, { products });
  
  return true;
}

// Funções para gerenciar usuários
export async function getUsers() {
  const data = await readJsonFile<{ users: any[] }>(USERS_FILE);
  return data.users || [];
}

export async function getUser(id: number) {
  const users = await getUsers();
  return users.find(user => user.id === id);
}

export async function getUserByEmail(email: string) {
  const users = await getUsers();
  return users.find(user => user.email === email);
}

export async function createUser(userData: InsertUser) {
  const data = await readJsonFile<{ users: any[] }>(USERS_FILE);
  const users = data.users || [];
  
  // Gerar novo ID
  const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  
  const newUser = {
    id,
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  await writeJsonFile(USERS_FILE, { users });
  
  return newUser;
}

export async function updateUser(id: number, userData: Partial<InsertUser>) {
  const data = await readJsonFile<{ users: any[] }>(USERS_FILE);
  let users = data.users || [];
  
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Se a senha foi fornecida, hash ela
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  
  users[index] = {
    ...users[index],
    ...userData
  };
  
  await writeJsonFile(USERS_FILE, { users });
  
  return users[index];
}

// Funções para gerenciar pedidos
export async function getOrders() {
  const data = await readJsonFile<{ orders: any[] }>(ORDERS_FILE);
  return data.orders || [];
}

export async function getOrder(id: number) {
  const orders = await getOrders();
  return orders.find(order => order.id === id);
}

export async function getOrdersByUser(userId: number) {
  const orders = await getOrders();
  return orders.filter(order => order.userId === userId);
}

export async function createOrder(orderData: InsertOrder) {
  const data = await readJsonFile<{ 
    orders: any[],
    orderItems: any[],
    payments: any[]
  }>(ORDERS_FILE);
  
  let orders = data.orders || [];
  
  // Gerar novo ID
  const id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
  
  const newOrder = {
    id,
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  data.orders = orders;
  
  await writeJsonFile(ORDERS_FILE, data);
  
  return newOrder;
}

export async function updateOrder(id: number, orderData: Partial<InsertOrder>) {
  const data = await readJsonFile<{ orders: any[] }>(ORDERS_FILE);
  let orders = data.orders || [];
  
  const index = orders.findIndex(order => order.id === id);
  
  if (index === -1) {
    return null;
  }
  
  orders[index] = {
    ...orders[index],
    ...orderData,
    updatedAt: new Date().toISOString()
  };
  
  await writeJsonFile(ORDERS_FILE, { ...data, orders });
  
  return orders[index];
}

// Funções para gerenciar itens de pedido
export async function getOrderItems(orderId: number) {
  const data = await readJsonFile<{ orderItems: any[] }>(ORDERS_FILE);
  const items = data.orderItems || [];
  return items.filter(item => item.orderId === orderId);
}

export async function createOrderItem(itemData: InsertOrderItem) {
  const data = await readJsonFile<{ 
    orders: any[],
    orderItems: any[],
    payments: any[]
  }>(ORDERS_FILE);
  
  let items = data.orderItems || [];
  
  // Gerar novo ID
  const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  
  const newItem = {
    id,
    ...itemData
  };
  
  items.push(newItem);
  
  data.orderItems = items;
  
  await writeJsonFile(ORDERS_FILE, data);
  
  return newItem;
}

// Funções para gerenciar pagamentos
export async function getPayment(orderId: number) {
  const data = await readJsonFile<{ payments: any[] }>(ORDERS_FILE);
  const payments = data.payments || [];
  return payments.find(payment => payment.orderId === orderId);
}

export async function createPayment(paymentData: InsertPayment) {
  const data = await readJsonFile<{ 
    orders: any[],
    orderItems: any[],
    payments: any[]
  }>(ORDERS_FILE);
  
  let payments = data.payments || [];
  
  // Gerar novo ID
  const id = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
  
  const newPayment = {
    id,
    ...paymentData,
    createdAt: new Date().toISOString()
  };
  
  payments.push(newPayment);
  
  data.payments = payments;
  
  await writeJsonFile(ORDERS_FILE, data);
  
  return newPayment;
}

export async function updatePayment(id: number, paymentData: Partial<InsertPayment>) {
  const data = await readJsonFile<{ 
    orders: any[],
    orderItems: any[],
    payments: any[]
  }>(ORDERS_FILE);
  
  let payments = data.payments || [];
  
  const index = payments.findIndex(payment => payment.id === id);
  
  if (index === -1) {
    return null;
  }
  
  payments[index] = {
    ...payments[index],
    ...paymentData
  };
  
  data.payments = payments;
  
  await writeJsonFile(ORDERS_FILE, data);
  
  return payments[index];
}

// Função para o dashboard
export async function getDashboardStats() {
  const orders = await getOrders();
  const products = await getProducts();
  const users = await getUsers();
  
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === "pendente").length;
  const productCount = products.length;
  
  return {
    totalOrders,
    totalSales,
    pendingOrders,
    productCount
  };
}

// Funções adicionais para produtos
export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter(product => product.isFeatured);
}

export async function getPromotionProducts() {
  const products = await getProducts();
  return products.filter(product => product.isPromotion);
}

// Funções adicionais para pedidos
export async function getOrderWithItems(id: number) {
  const order = await getOrder(id);
  if (!order) return undefined;
  
  const data = await readJsonFile<{ orderItems: any[] }>(ORDERS_FILE);
  const items = (data.orderItems || []).filter(item => item.orderId === id);
  
  // Obter produtos para cada item
  const products = await getProducts();
  
  const itemsWithProducts = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  });
  
  return {
    order,
    items: itemsWithProducts
  };
}

export async function updateOrderStatus(id: number, status: "pendente" | "confirmado" | "preparo" | "entrega" | "concluido" | "cancelado") {
  return updateOrder(id, { status });
}

// Funções adicionais para pagamentos
export async function getPaymentByOrder(orderId: number) {
  const data = await readJsonFile<{ payments: any[] }>(ORDERS_FILE);
  const payments = data.payments || [];
  return payments.find(payment => payment.orderId === orderId);
}

export async function updatePaymentStatus(id: number, status: string) {
  const data = await readJsonFile<{ 
    payments: any[]
  }>(ORDERS_FILE);
  
  let payments = data.payments || [];
  
  const index = payments.findIndex(payment => payment.id === id);
  
  if (index === -1) {
    return null;
  }
  
  payments[index] = {
    ...payments[index],
    status
  };
  
  data.payments = payments;
  
  await writeJsonFile(ORDERS_FILE, data);
  
  return payments[index];
} 