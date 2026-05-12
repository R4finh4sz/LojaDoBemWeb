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
  { value: "+ pontos", label: "locais de troca planejados na cidade" },
  { value: "Ecocoins", label: "convertidos a partir de recicláveis entregues" },
  { value: "Recompensas", label: "alimentos e itens cadastrados pelos admins" },
];

const howItWorksSteps = [
  {
    title: "1. Separe e leve",
    description:
      "O cidadão junta recicláveis e leva até um ponto credenciado na cidade.",
  },
  {
    title: "2. Valide e pontue",
    description:
      "A equipe registra a entrega e converte o material em ecocoins na hora.",
  },
  {
    title: "3. Troque por benefícios",
    description:
      "Os pontos podem ser usados em alimentos e itens cadastrados pelos administradores e pelo master.",
  },
];

const benefits = [
  {
    kicker: "Para moradores",
    title: "Entrega com retorno imediato.",
    description:
      "Recicla, acumula ecocoins e acessa itens úteis sem complicação.",
    tone: "default" as const,
  },
  {
    kicker: "Para administradores",
    title: "Controle de pontos, estoques e trocas em um só lugar.",
    description:
      "Somente administradores e master acessam o login para cadastrar recompensas e gerir a operação.",
    tone: "accent" as const,
  },
  {
    kicker: "Para a cidade",
    title: "Mais engajamento e menos descarte irregular.",
    description:
      "A plataforma ajuda a distribuir pontos de troca e fomentar cultura sustentável local.",
    tone: "default" as const,
  },
];

const closingBullets = [
  "Cadastro de recompensas por administradores",
  "Saldo de ecocoins por usuário",
  "Pontos de coleta por região",
  "Troca por alimentos e itens úteis",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(6,95,70,0.12),transparent_22%)]" />

      <LandingHeader logo={logoImage} navItems={navItems} />

      <section className="mx-auto flex w-full max-w-7xl justify-center px-6 pb-20 pt-8 sm:px-10 lg:px-12 lg:pb-28 lg:pt-12">
        <div className="w-full max-w-5xl">
          <HeroSection
            kicker="Economia circular na prática"
            title="Reciclagem que vira valor real para pessoas e cidades."
            description="O ReciclaOnline conecta moradores, pontos de coleta e administradores para transformar resíduos em ecocoins, pontos que podem ser trocados por alimentos e itens cadastrados pelos responsáveis do sistema."
            primaryAction={{ href: "Auth/Login", label: "Acessar painel de admin" }}
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
        title="Um fluxo simples para incentivar reciclagem e recompensar a comunidade."
        description="A proposta é dar valor ao que seria descartado, gerando pontos acumuláveis e fortalecendo a relação entre moradores, poder público e comércio local."
        steps={howItWorksSteps}
      />

      <BenefitsSection id="beneficios" cards={benefits} />

      <ClosingSection
        id="trocas"
        kicker="Trocas e recompensas"
        title="Ecocoins que conectam reciclagem a alimentos e benefícios reais."
        description="O ReciclaOnline nasce para organizar a experiência, dar visibilidade aos pontos de coleta e permitir que administradores e master alimentem o catálogo de recompensas de forma controlada."
        bullets={closingBullets}
      />
    </main>
  );
}
