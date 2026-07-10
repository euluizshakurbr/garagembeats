import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import SiteHeader from "@/components/SiteHeader";

export default function EsqueciSenhaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
