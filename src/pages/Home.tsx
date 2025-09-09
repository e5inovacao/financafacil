import React, { useState } from 'react';
import { Check, Star, MessageCircle, ChevronDown, ChevronUp, LogIn, TrendingUp, Shield, Smartphone, BarChart3, Target, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Como funciona o período de teste?",
    answer: "Oferecemos 7 dias gratuitos para você testar todas as funcionalidades do Finança Fácil sem compromisso."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento através do painel de configurações da sua conta."
  },
  {
    question: "Os dados ficam seguros na plataforma?",
    answer: "Sim, utilizamos criptografia de ponta e seguimos as melhores práticas de segurança para proteger seus dados financeiros."
  },
  {
    question: "Posso usar em múltiplos dispositivos?",
    answer: "Sim, você pode acessar sua conta em qualquer dispositivo - computador, tablet ou smartphone."
  },
  {
    question: "Como funciona o suporte ao cliente?",
    answer: "Oferecemos suporte via WhatsApp durante horário comercial e nossa base de conhecimento está disponível 24/7."
  }
];

function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/5 rounded-full -translate-y-48 -translate-x-48"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-600/5 rounded-full translate-y-36 translate-x-36"></div>
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-green-100 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8">
            ❓ Dúvidas Frequentes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perguntas
            <span className="block text-green-600">Frequentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tire suas dúvidas sobre o Finança Fácil e descubra como nossa plataforma pode transformar sua vida financeira
          </p>
        </div>
        
        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-green-200">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-green-50/50 transition-all duration-300 rounded-2xl"
              >
                <span className="font-bold text-gray-900 text-lg">{item.question}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openItems.includes(index) 
                    ? 'bg-green-500 text-white rotate-180' 
                    : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                }`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
              {openItems.includes(index) && (
                <div className="px-8 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed text-lg">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const whatsappNumber = "5511999999999"; // Substitua pelo número real
  const whatsappMessage = "Olá! Gostaria de saber mais sobre o Finança Fácil.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Header com botão de login */}
      <header className="absolute top-0 left-0 right-0 z-10 py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="text-gray-900 font-bold text-2xl">
            Finança Fácil
          </div>
          <Link 
            to="/login"
            className="flex items-center bg-gray-100 backdrop-blur-sm text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all border border-gray-200"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Entrar
          </Link>
        </div>
      </header>
      {/* Hero Section - Apresentação do Aplicativo */}
      <section className="relative bg-gradient-to-br from-white via-green-50/30 to-white min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <TrendingUp className="w-4 h-4 mr-2" />
            Desenvolva os processos das suas finanças e tenha mais resultados
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900">
            Transforme suas
            <span className="block text-green-600">finanças pessoais</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto">
            <span className="font-semibold text-gray-900">94% dos brasileiros</span> acreditam que poderiam ter mais controle financeiro se tivessem uma ferramenta mais qualificada. Evolua sua gestão financeira com o <span className="font-semibold text-green-600">Finança Fácil</span>.
          </p>
          
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              to="/register"
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Começar gratuitamente
            </Link>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all"
            >
              Falar com especialista
            </a>
          </div>
          
          <p className="text-sm text-gray-500">
            ✓ 7 dias grátis • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Seção de Recursos Principais */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Recursos principais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Organize suas finanças
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O guia para o seu sucesso financeiro
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">01</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Suas contas e cartões num só lugar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comece cadastrando suas contas e cartões para ter uma visão mais clara das suas finanças.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">02</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cadastre todos os seus gastos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Garanta uma previsibilidade financeira poderosa cadastrando suas despesas em tempo real, de onde você estiver.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">03</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Saiba o destino de cada centavo
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Mantenha tudo sob controle informando sua renda e ganhos extras para ter um ponto de partida.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">04</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transformando em hábito
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Lance os gastos do dia a dia, acompanhe os relatórios sempre que possível e assuma o controle do seu dinheiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section id="como-funciona" className="py-24 bg-gradient-to-br from-white via-green-50/20 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Users className="w-4 h-4 mr-2" />
              Metodologia comprovada
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Como transformamos suas
              <span className="block text-green-600">finanças em 3 passos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Nossa metodologia exclusiva já ajudou milhares de pessoas a conquistarem a liberdade financeira. Veja como é simples começar sua transformação hoje mesmo.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="group relative">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-green-50 text-green-700 text-sm font-bold px-4 py-2 rounded-full">
                    PASSO 01
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Diagnóstico Financeiro Completo
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Conecte suas contas bancárias e cartões para uma análise automática e detalhada da sua situação financeira atual. Nossa IA identifica padrões e oportunidades de melhoria.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Conexão segura com bancos
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Categorização automática
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Análise de padrões de gastos
                  </div>
                </div>
              </div>
              
              {/* Seta conectora */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
            
            {/* Passo 2 */}
            <div className="group relative">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-green-50 text-green-700 text-sm font-bold px-4 py-2 rounded-full">
                    PASSO 02
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Estratégia Personalizada
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Com base no seu perfil, criamos um plano de ação personalizado com metas realistas e estratégias específicas para otimizar suas finanças e alcançar seus objetivos.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Metas personalizadas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Orçamento inteligente
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Alertas e lembretes
                  </div>
                </div>
              </div>
              
              {/* Seta conectora */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
            
            {/* Passo 3 */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-green-50 text-green-700 text-sm font-bold px-4 py-2 rounded-full">
                    PASSO 03
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Acompanhamento e Resultados
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Monitore seu progresso em tempo real com dashboards intuitivos, relatórios detalhados e insights que te ajudam a tomar decisões cada vez mais inteligentes.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Dashboards em tempo real
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Relatórios inteligentes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Insights personalizados
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action da seção */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Pronto para começar sua transformação financeira?</h3>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                Junte-se a mais de 10.000 pessoas que já descobriram o poder de ter controle total sobre suas finanças
              </p>
              <Link 
                to="/register"
                className="inline-flex items-center bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Começar gratuitamente agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Por que escolher o Finança Fácil?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transforme sua vida financeira com
              <span className="text-green-600"> resultados comprovados</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Junte-se a milhares de pessoas que já descobriram o poder de ter controle total sobre suas finanças pessoais
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Card 1 - Controle Total */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Controle Total das Finanças
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Tenha uma visão completa de todas as suas receitas e despesas organizadas por categorias personalizadas. Monitore cada centavo e tome decisões mais inteligentes.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Card 2 - Segurança */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Segurança de Nível Bancário
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Seus dados financeiros estão protegidos com criptografia de ponta e tecnologia de segurança avançada. Confiança total em cada transação.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Card 3 - Mobilidade */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Acesso em Qualquer Lugar
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Interface responsiva que funciona perfeitamente em desktop, tablet e smartphone. Suas finanças sempre ao seu alcance, onde quer que você esteja.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          {/* Seção de Estatísticas */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Resultados que Falam por Si</h3>
              <p className="text-green-100 text-lg">Veja o impacto real que nossa plataforma tem na vida das pessoas</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10k+</div>
                <div className="text-green-100">Usuários ativos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">R$ 50M+</div>
                <div className="text-green-100">Gerenciados na plataforma</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-green-100">Satisfação dos usuários</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-green-100">Suporte disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos de Assinatura */}
      <section id="planos" className="py-24 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4 mr-2" />
              Planos e Preços
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Escolha o plano ideal para
              <span className="block text-green-600">sua transformação</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Todos os planos incluem acesso completo a todas as funcionalidades premium. Comece com 7 dias gratuitos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="text-center relative z-10">
                <div className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  Flexibilidade
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensal</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-green-600">R$ 59,90</span>
                  <span className="text-gray-600 text-lg">/mês</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Controle completo de finanças</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Relatórios e gráficos</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Metas financeiras</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Suporte via WhatsApp</span>
                  </li>
                </ul>
                <div className="flex justify-center">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Começar Agora
                  </button>
                </div>
              </div>
            </div>
            
            {/* Plano Trimestral - Recomendado */}
            <div className="bg-white border-2 rounded-3xl p-8 relative transform scale-105 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 overflow-hidden" style={{borderColor: '#16c64f'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-green-100/30"></div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Recomendado
                </span>
              </div>
              <div className="text-center relative z-10">
                <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4 mt-4">
                  Melhor Custo-Benefício
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Trimestral</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">R$ 149,00</span>
                  <span className="text-gray-600 text-lg">/3 meses</span>
                </div>
                <div className="mb-6">
                  <div className="inline-flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold mt-2">
                    💰 Economize R$ 30,70
                  </div>
                  <br />
                  <span className="text-sm text-gray-500">vs. plano mensal</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Controle completo de finanças</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Relatórios e gráficos</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Metas financeiras</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Suporte via WhatsApp</span>
                  </li>
                </ul>
                <div className="flex justify-center">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Começar Agora
                  </button>
                </div>
              </div>
            </div>
            
            {/* Plano Anual */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full -translate-y-16 -translate-x-16 opacity-50"></div>
              <div className="text-center relative z-10">
                <div className="inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  💎 Máxima Economia
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Anual</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-green-600">R$ 479,00</span>
                  <span className="text-gray-600 text-lg">/ano</span>
                </div>
                <div className="mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mt-2">
                    🔥 Economize R$ 239,80
                  </div>
                  <br />
                  <span className="text-sm text-gray-500 mt-1 block">vs. plano mensal</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Controle completo de finanças</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Relatórios e gráficos</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Metas financeiras</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Suporte via WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">🎯 Consultoria mensal</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">⚡ Acesso prioritário</span>
                  </li>
                </ul>
                <div className="flex justify-center">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Começar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato WhatsApp */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
            💬 Suporte Especializado
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Precisa de ajuda?
            <span className="block text-green-200">Fale conosco!</span>
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nossa equipe de especialistas está pronta para esclarecer suas dúvidas e ajudar você a começar sua jornada financeira.
          </p>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-green-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Falar no WhatsApp
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
          <div className="flex items-center justify-center space-x-8 mt-8 text-green-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm">Resposta em até 2 horas</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm">Atendimento humanizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/5 rounded-full -translate-y-36 -translate-x-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600/5 rounded-full translate-y-48 translate-x-48"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center bg-green-500/10 backdrop-blur-sm text-green-400 px-6 py-3 rounded-full text-sm font-semibold mb-8">
            🚀 Transformação Financeira
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comece hoje mesmo a
            <span className="block text-green-400">transformar suas finanças</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que já estão no controle das suas finanças e construindo um futuro próspero
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a 
              href="#planos" 
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl hover:from-green-700 hover:to-green-800"
            >
              Escolher Plano
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-transparent border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-green-500 hover:text-green-400 transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Especialista
            </a>
          </div>
          <div className="flex items-center justify-center space-x-8 text-gray-400 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>7 dias gratuitos</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Moderno */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Seção principal do footer */}
          <div className="py-20">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Finança Fácil</span>
                </div>
                <p className="text-gray-300 mb-10 max-w-lg leading-relaxed text-lg">
                  Transforme sua relação com o dinheiro. Nossa plataforma oferece as ferramentas necessárias para você alcançar a liberdade financeira e construir um futuro próspero.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold mb-8 text-white">Produto</h4>
                <ul className="space-y-4">
                  <li><a href="#recursos" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Recursos
                  </a></li>
                  <li><a href="#como-funciona" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Como funciona
                  </a></li>
                  <li><a href="#beneficios" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Benefícios
                  </a></li>
                  <li><a href="#planos" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Planos
                  </a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xl font-bold mb-8 text-white">Suporte</h4>
                <ul className="space-y-4">
                  <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contato
                  </a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Central de Ajuda
                  </a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                     <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                     Política de Privacidade
                   </a></li>
                   <li><a href="#" className="text-gray-400 hover:text-gray-300 transition-colors flex items-center group">
                     <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                     Termos de Uso
                   </a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Linha divisória e copyright */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Finança Fácil. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Feito com</span>
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">❤️</span>
                  <span className="text-gray-400 text-sm">no Brasil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}