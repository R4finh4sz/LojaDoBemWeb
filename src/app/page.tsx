import logoImage from "@/assets/Images/LogoImage.png";
import { BenefitsSection } from "@/components/screens/landing-page/benefits-section/index";
import { ClosingSection } from "@/components/screens/landing-page/closing-section/index";
import { HeroSection } from "@/components/screens/landing-page/hero-section/index";
import { HowItWorksSection } from "@/components/screens/landing-page/how-it-works-section/index";
import { LandingHeader } from "@/components/screens/landing-page/landing-header/index";

const navItems = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Trocas", href: "#trocas" },
];

const heroStats = [
  { value: "Prefeitura", label: "pré-cadastro de moradores e atendimento" },
  { value: "Cooperativas", label: "crédito de ecocoins pelas entregas" },
  { value: "Loja municipal", label: "troca de ecocoins por produtos disponíveis" },
];

const howItWorksSteps = [
  {
    title: "1. Faça o pré-cadastro",
    description:
      "Procure a equipe de atendimento da prefeitura para fazer o pré-cadastro e confirme que leu e aceitou os termos de uso.",
  },
  {
    title: "2. Entregue seus recicláveis",
    description:
      "Leve os materiais recicláveis a uma cooperativa participante. A equipe usa seu CPF para creditar os ecocoins no seu saldo.",
  },
  {
    title: "3. Use seus ecocoins",
    description:
      "Escolha entre os produtos disponíveis na loja municipal. A equipe localiza seu cadastro pelo CPF e confirma a troca com débito no saldo.",
  },
];

const benefits = [
  {
    kicker: "Para moradores",
    title: "Ecocoins para trocar por produtos",
    description:
      "Acumule ecocoins com suas entregas e use o saldo para resgatar alimentos e outros produtos disponíveis.",
    tone: "default" as const,
  },
  {
    kicker: "Para prefeituras e cooperativas",
    title: "Atendimento, estoque e créditos",
    description:
      "A equipe municipal pré-cadastra moradores, gerencia o estoque e registra as trocas. As cooperativas creditam os ecocoins.",
    tone: "accent" as const,
  },
  {
    kicker: "Para a administração central",
    title: "Gestão de municípios e operadores",
    description:
      "O perfil Master cadastra municípios, gerencia os acessos das equipes e publica os termos de uso.",
    tone: "default" as const,
  },
];

const closingBullets = [
  "Identificação do morador pelo CPF",
  "Preços dos produtos em ecocoins",
  "Débito no saldo após a confirmação da troca",
  "Comprovante com protocolo e saldo restante",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbf8] text-slate-900 dark:bg-[#07100b] dark:text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_34%)]" />

      <LandingHeader logo={logoImage} navItems={navItems} />

      <section className="mx-auto flex w-full max-w-7xl justify-center px-6 pb-20 pt-8 sm:px-10 lg:px-12 lg:pb-28 lg:pt-12">
        <div className="w-full max-w-5xl">
          <HeroSection
            kicker="Economia circular na prática"
            title="Troque recicláveis por ecocoins"
            description="No ReciclaOnline, moradores entregam recicláveis a cooperativas participantes, recebem ecocoins e usam o saldo para resgatar produtos na loja municipal."
            primaryAction={{ href: "Auth/Login", label: "Acessar painel de operação" }}
            secondaryAction={{
              href: "#como-funciona",
              label: "Ver como funciona",
            }}
            stats={heroStats}
            centered
          />
        </div>
      </section>

      <HowItWorksSection
        id="como-funciona"
        kicker="Como funciona"
        title="Do pré-cadastro à troca na loja municipal"
        description="A prefeitura faz o pré-cadastro, a cooperativa credita os ecocoins e a loja municipal registra o resgate."
        steps={howItWorksSteps}
      />

      <BenefitsSection id="beneficios" cards={benefits} />

      <ClosingSection
        id="trocas"
        kicker="Trocas e recompensas"
        title="Como funciona o resgate na loja municipal"
        description="Consulte os produtos disponíveis e seus preços em ecocoins com a equipe da loja municipal. Após a confirmação, você recebe um comprovante com o protocolo e o saldo atualizado."
        bullets={closingBullets}
      />
    </main>
  );
}
