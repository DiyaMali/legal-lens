import { Metadata } from 'next';
import { LoginForm } from "@/components/ui/login-form";

export const metadata: Metadata = {
  title: 'Sign In - Legal Lens',
  description: 'Sign in to Legal Lens to analyze, compare, and understand legal documents.',
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] w-full flex items-center justify-center p-4">
      <div className="w-full flex items-center justify-center py-12">
        <LoginForm />
      </div>
    </main>
  );
}
