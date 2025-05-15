import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/LoginForm";
import CartSidebar from "@/components/CartSidebar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, Search, ShoppingCart, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { cart, openCart } = useCart();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  
  // Fechar o menu ao mudar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const handleLogout = async () => {
    await logout();
    if (location.startsWith('/admin')) {
      navigate('/');
    }
  };
  
  // Alternar entre login e registro
  const showLoginForm = () => {
    setLoginOpen(true);
  };

  // Verificar se é página de admin
  const isAdminPage = location.startsWith('/admin');
  const isLoginPage = location === '/login';
  
  // Determinar quais links mostrar baseado no tipo de página
  const renderNavLinks = () => {
    if (isAdminPage) {
      return (
        <div className="hidden md:ml-6 md:flex md:space-x-4">
          <Link href="/admin" className="hover:text-primary transition-colors py-2 px-3">
            Dashboard
          </Link>
          <Link href="/admin/categorias" className="hover:text-primary transition-colors py-2 px-3">
            Categorias
          </Link>
          <Link href="/admin/produtos" className="hover:text-primary transition-colors py-2 px-3">
            Produtos
          </Link>
          <Link href="/" className="hover:text-primary transition-colors py-2 px-3">
            Início
          </Link>
        </div>
      );
    } else if (user && user.type === 'admin' && !isLoginPage) {
      return (
        <div className="hidden md:ml-6 md:flex md:space-x-4">
          <Link href="/" className="hover:text-primary transition-colors py-2 px-3">
            Início
          </Link>
          <Link href="/cardapio" className="hover:text-primary transition-colors py-2 px-3">
            Cardápio
          </Link>
          <Link href="/admin" className="hover:text-primary transition-colors py-2 px-3">
            Área Admin
          </Link>
        </div>
      );
    } else if (!isLoginPage) {
      return (
        <div className="hidden md:ml-6 md:flex md:space-x-4">
          <Link href="/" className="hover:text-primary transition-colors py-2 px-3">
            Início
          </Link>
          <Link href="/cardapio" className="hover:text-primary transition-colors py-2 px-3">
            Cardápio
          </Link>
          <Link href="/sobre" className="hover:text-primary transition-colors py-2 px-3">
            Sobre
          </Link>
          <Link href="/contato" className="hover:text-primary transition-colors py-2 px-3">
            Contato
          </Link>
        </div>
      );
    }
    return null;
  };
  
  // Renderizar links do menu mobile
  const renderMobileLinks = () => {
    if (isAdminPage) {
      return (
        <>
          <Link href="/admin" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Dashboard
          </Link>
          <Link href="/admin/categorias" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Categorias
          </Link>
          <Link href="/admin/produtos" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Produtos
          </Link>
          <Link href="/" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Início
          </Link>
        </>
      );
    } else if (user && user.type === 'admin' && !isLoginPage) {
      return (
        <>
          <Link href="/" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Início
          </Link>
          <Link href="/cardapio" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Cardápio
          </Link>
          <Link href="/admin" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Área Admin
          </Link>
        </>
      );
    } else if (!isLoginPage) {
      return (
        <>
          <Link href="/" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Início
          </Link>
          <Link href="/cardapio" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Cardápio
          </Link>
          <Link href="/sobre" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Sobre
          </Link>
          <Link href="/contato" className="hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
            Contato
          </Link>
        </>
      );
    }
    return null;
  };
  
  return (
    <>
      <nav className="bg-background shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
              </Link>
              
              {renderNavLinks()}
            </div>
            
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {!isAdminPage && !isLoginPage ? (
                <>
                  <button
                    className="hover:text-primary transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-6 w-6" />
                  </button>
                  <button
                    className="hover:text-primary transition-colors relative"
                    aria-label="Cart"
                    onClick={() => setCartOpen(true)}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </>
              ) : null}
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => setLoginOpen(true)}
                >
                  Área Administrativa
                </Button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              {!isAdminPage && !isLoginPage && (
                <button
                  className="mr-2 hover:text-primary transition-colors relative"
                  aria-label="Cart"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}
              
              <button
                className="inline-flex items-center justify-center p-2 rounded-md hover:text-primary transition-colors"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Abrir menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {renderMobileLinks()}
              
              {user ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="ml-3 mb-2">
                  Sair
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={showLoginForm}
                  className="ml-3 mb-2"
                >
                  Área Administrativa
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
      />
      
      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Área Administrativa</DialogTitle>
            <DialogDescription>
              Acesse como administrador para gerenciar produtos e pedidos
            </DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => setLoginOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
