import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Connexion — Mon Troupeau" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <span className="text-4xl">🐑</span>
        <h1 className="text-xl font-bold">Mon Troupeau</h1>
        <p className="text-sm text-muted">Connecte-toi pour accéder à l&apos;élevage.</p>
      </div>
      <LoginForm />
    </div>
  );
}
