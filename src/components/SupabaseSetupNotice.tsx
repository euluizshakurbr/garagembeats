export default function SupabaseSetupNotice() {
  return (
    <div className="mt-10 rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 text-[#888]">
      <p className="font-medium text-white">Supabase ainda não configurado</p>
      <p className="mt-2 text-sm">
        Crie um projeto em{" "}
        <a
          href="https://supabase.com"
          className="text-white hover:underline"
          target="_blank"
        >
          supabase.com
        </a>
        , cole as chaves no <code className="text-[#CC1111]">.env.local</code>{" "}
        e rode o <code className="text-[#CC1111]">supabase-schema.sql</code>{" "}
        no SQL Editor pra essa página funcionar.
      </p>
    </div>
  );
}

