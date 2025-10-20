
import React from 'react';
import { Palette, Layers, MousePointerClick, Smartphone } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">{icon}</div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="space-y-4 text-slate-600">{children}</div>
    </div>
);

const DesignSystemGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Guia de Evolução do Design System & UX</h1>
        <p className="text-slate-600 mt-1">Um plano estratégico para tornar nosso CRM mais consistente, bonito e agradável de usar.</p>
      </header>

      <Section title="Componentização e Consistência" icon={<Layers size={24} />}>
        <p>A base de um bom design system é a componentização. Em vez de estilizar cada botão ou card individualmente, criaremos componentes padronizados e reutilizáveis. Isso garante consistência visual em toda a plataforma e acelera o desenvolvimento.</p>
        <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Exemplo: Componente de Botão</h4>
            <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Botão Primário</button>
                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">Botão Secundário</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors">Botão de Risco</button>
            </div>
            <pre className="mt-4 p-2 bg-slate-200 text-sm rounded text-slate-800 overflow-auto">{'<Button variant="primary">Texto</Button>\n<Button variant="secondary">Texto</Button>\n<Button variant="danger">Texto</Button>'}</pre>
        </div>
      </Section>

      <Section title="Tema e Personalização" icon={<Palette size={24} />}>
        <p>Podemos implementar um sistema de temas que permita ao usuário escolher entre um modo claro (light) e um modo escuro (dark). Isso melhora a acessibilidade e o conforto visual em diferentes ambientes de iluminação. As cores seriam gerenciadas por variáveis CSS para facilitar a troca.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">Exemplo: Light Mode (Atual)</h4>
                <div className="p-4 bg-slate-100 rounded">
                    <p className="text-slate-800">Este é um card em modo claro.</p>
                </div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h4 className="font-semibold mb-2 text-white">Exemplo: Dark Mode</h4>
                <div className="p-4 bg-slate-700 rounded">
                    <p className="text-slate-200">Este é um card em modo escuro.</p>
                </div>
            </div>
        </div>
      </Section>

      <Section title="Microinterações e Feedback Visual" icon={<MousePointerClick size={24} />}>
        <p>Pequenas animações e transições (microinterações) tornam a interface mais viva e comunicam o status das ações do usuário. Isso inclui efeitos de hover, estados de carregamento e confirmações visuais.</p>
        <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Exemplo: Card Interativo</h4>
            <p className="text-sm mb-2">Passe o mouse sobre o card para ver o efeito.</p>
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl cursor-pointer">
                <h3 className="font-bold text-slate-800">Card com Microinteração</h3>
                <p className="text-slate-600">Uma leve animação de escala e sombra ao interagir.</p>
            </div>
        </div>
      </Section>

      <Section title="Layouts Adaptativos e Responsividade" icon={<Smartphone size={24} />}>
        <p>Além de garantir que o layout não quebre em telas menores, podemos criar layouts verdadeiramente adaptativos. Por exemplo, uma barra lateral que se recolhe em um menu de ícones em tablets, ou um layout de múltiplas colunas que se transforma em uma única coluna em smartphones.</p>
        <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Exemplo: Layout de Dashboard</h4>
            <p className="text-sm">Em telas grandes, usamos um grid com várias colunas. Em telas pequenas, os cards empilham verticalmente para melhor legibilidade, como já acontece parcialmente hoje, mas que pode ser aprimorado com pontos de quebra mais inteligentes.</p>
            <div className="mt-2 p-4 border border-dashed border-slate-400 rounded-lg">
                <p className="text-center text-slate-500">Simulação de Tela de Smartphone</p>
                <div className="mt-2 space-y-4">
                    <div className="p-4 bg-white rounded-lg shadow"><p>Card 1</p></div>
                    <div className="p-4 bg-white rounded-lg shadow"><p>Card 2</p></div>
                </div>
            </div>
        </div>
      </Section>
    </div>
  );
};

export default DesignSystemGuide;
