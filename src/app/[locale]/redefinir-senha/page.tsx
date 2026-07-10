import ResetPasswordForm from "@/components/ResetPasswordForm";
import SiteHeader from "@/components/SiteHeader";

export default function RedefinirSenhaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
