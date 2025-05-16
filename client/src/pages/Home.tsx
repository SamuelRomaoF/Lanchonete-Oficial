import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { Category, Product } from "@shared/schema";

const Home = () => {
  // Buscar categorias
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Buscar produtos em destaque
  const {
    data: allProducts = [],
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filtrar produtos em destaque e em promoção a partir de todos os produtos
  const featuredProducts = allProducts.filter(product => product.isFeatured);
  const promotionProducts = allProducts.filter(product => product.isPromotion);

  // Renderizar a página principal
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner principal */}
      <div className="bg-gradient-to-r from-primary to-primary/70 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4">FastLanche Faculdade</h1>
        <p className="text-xl mb-6">Lanches deliciosos e atendimento de qualidade para os estudantes!</p>
        <Link href="/cardapio">
          <Button variant="secondary" size="lg">Ver Cardápio</Button>
        </Link>
      </div>

      {/* Categorias */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Categorias</h2>
          <Link href="/cardapio">
            <Button variant="ghost">Ver todas</Button>
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        )}
      </section>

      {/* Produtos em destaque */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Destaques</h2>
          <Link href="/cardapio">
            <Button variant="ghost">Ver todos</Button>
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                oldPrice={product.oldPrice ? Number(product.oldPrice) : undefined}
                imageUrl={product.imageUrl}
                isFeatured={product.isFeatured}
                isPromotion={product.isPromotion}
              />
            ))}
            {featuredProducts.length === 0 && (
              <p className="col-span-3 text-center py-8 text-muted-foreground">
                Nenhum produto em destaque disponível no momento.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Promoções */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Promoções</h2>
          <Link href="/cardapio">
            <Button variant="ghost">Ver todas</Button>
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotionProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                oldPrice={product.oldPrice ? Number(product.oldPrice) : undefined}
                imageUrl={product.imageUrl}
                isFeatured={product.isFeatured}
                isPromotion={product.isPromotion}
              />
            ))}
            {promotionProducts.length === 0 && (
              <p className="col-span-3 text-center py-8 text-muted-foreground">
                Nenhuma promoção disponível no momento.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
