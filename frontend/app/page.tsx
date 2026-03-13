import { AnimatedLogo, Logo } from "@/components/common/logo";
import { ThemeSwitch } from "@/components/common/theme-switch";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AnimatedLogo size={52} />
          <h1 className="text-xl font-semibold tracking-tight font-prompt">
            Omnix
          </h1>
        </div>
        <ThemeSwitch />
      </header>
    </main>
  );
}
