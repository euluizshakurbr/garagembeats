import NavLink from "@/components/NavLink";

// Menu de navegação entre as telas de admin.
export default function AdminNav() {
  const linkClass =
    "rounded-xl border border-[#1a1a1a] px-4 py-2 text-sm font-semibold text-[#888] transition-colors hover:text-white";
  const activeClass = "!border-[#CC1111] !text-white";

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <NavLink href="/admin/painel" exact className={linkClass} activeClassName={activeClass}>
        Painel
      </NavLink>
      <NavLink href="/admin" exact className={linkClass} activeClassName={activeClass}>
        Músicas
      </NavLink>
      <NavLink href="/admin/pedidos" exact className={linkClass} activeClassName={activeClass}>
        Pedidos
      </NavLink>
      <NavLink href="/admin/depoimentos" exact className={linkClass} activeClassName={activeClass}>
        Depoimentos
      </NavLink>
    </nav>
  );
}
