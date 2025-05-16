import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sobre Nossa Lanchonete</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nossa História</h2>
          <p className="text-neutral-dark mb-4">
            Fundada em 2020, nossa lanchonete nasceu do sonho de oferecer lanches de qualidade com 
            ingredientes frescos e um atendimento diferenciado. O que começou como um pequeno negócio 
            familiar rapidamente se transformou em um dos locais favoritos da região.
          </p>
          <p className="text-neutral-dark">
            Hoje, continuamos comprometidos com nossos valores iniciais: qualidade, frescor e satisfação 
            do cliente. Cada lanche é preparado com cuidado, usando apenas os melhores ingredientes.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nossa Missão</h2>
          <p className="text-neutral-dark">
            Proporcionar momentos de alegria através de lanches deliciosos, entregues rapidamente e com 
            o melhor custo-benefício. Queremos ser parte dos momentos especiais de nossos clientes, seja 
            um almoço rápido durante o trabalho ou uma reunião em família.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nossos Diferenciais</h2>
          <ul className="list-disc pl-5 space-y-2 text-neutral-dark">
            <li>Ingredientes selecionados e frescos</li>
            <li>Entrega rápida (em até 40 minutos)</li>
            <li>Embalagens sustentáveis</li>
            <li>Cardápio variado com opções para todos os gostos</li>
            <li>Promoções semanais exclusivas</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Horário de Funcionamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Segunda a Sexta:</p>
              <p className="text-neutral-dark">11h às 23h</p>
            </div>
            <div>
              <p className="font-medium">Sábados e Domingos:</p>
              <p className="text-neutral-dark">11h às 00h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 