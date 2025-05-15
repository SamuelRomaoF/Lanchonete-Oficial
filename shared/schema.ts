import { z } from "zod";

// Enums
export const userTypeEnum = z.enum(["cliente", "admin"]);
export type UserType = z.infer<typeof userTypeEnum>;

export const orderStatusEnum = z.enum(["pendente", "confirmado", "preparo", "entrega", "concluido", "cancelado"]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const paymentMethodEnum = z.enum(["pix", "cartao"]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

// Definições de schemas
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  type: userTypeEnum,
  createdAt: z.string().or(z.date())
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional()
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  imageUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isPromotion: z.boolean().default(false),
  oldPrice: z.number().nullable().optional(),
  categoryId: z.number(),
  available: z.boolean().default(true),
  createdAt: z.string().or(z.date())
});

export const orderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: orderStatusEnum.default("pendente"),
  total: z.number(),
  address: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
});

export const orderItemSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  productId: z.number(),
  quantity: z.number(),
  price: z.number(),
  subtotal: z.number()
});

export const paymentSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  method: paymentMethodEnum,
  status: z.string().default("pendente"),
  externalId: z.string().nullable().optional(),
  amount: z.number(),
  createdAt: z.string().or(z.date())
});

// Schemas de inserção
export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = categorySchema.omit({
  id: true,
});

export const insertProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = orderItemSchema.omit({
  id: true,
});

export const insertPaymentSchema = paymentSchema.omit({
  id: true,
  createdAt: true,
});

// Tipos
export type User = z.infer<typeof userSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Payment = z.infer<typeof paymentSchema>;

// Tipos de inserção
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
