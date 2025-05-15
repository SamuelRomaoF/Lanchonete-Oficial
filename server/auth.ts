import session from 'express-session';
import { Express, Request, Response, NextFunction } from 'express';
import MemoryStore from 'memorystore';

const MemoryStoreSession = MemoryStore(session);

export function setupAuth(app: Express) {
  // Configuração da sessão com MemoryStore (não persistente)
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // 24 horas (prune expired entries)
      }),
      secret: 'lanchonete-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Em desenvolvimento, defina como false
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        httpOnly: true,
        sameSite: 'lax'
      }
    })
  );

  // Middleware para deixar o usuário disponível em res.locals
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.user = req.session.user;
    next();
  });
}

// Definir tipagem para req.session
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      name: string;
      email: string;
      type: 'cliente' | 'admin';
    };
  }
}