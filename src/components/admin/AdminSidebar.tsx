import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/offers", label: "Offers" },
];

export const AdminSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-full lg:w-64 bg-background border-r flex-col lg:flex fixed top-0 left-0 h-20 lg:h-screen z-10 lg:z-0">
      <div className="h-20 flex items-center px-4 lg:px-6 border-b w-full">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <img src="/src/assets/bee-mascot.png" alt="Carry Bee" className="w-8 h-8" />
          <span className="">Carry Bee</span>
        </NavLink>
      </div>
      <nav className="flex-1 flex flex-row lg:flex-col items-center lg:items-start gap-4 p-4 lg:p-6 bg-background lg:bg-transparent">
        {links.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
