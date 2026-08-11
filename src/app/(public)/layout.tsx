import { ChatWidget } from "@/components/public/chat-widget";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { CartProvider } from "@/lib/cart/cart-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
      <SiteFooter />
      <ChatWidget
        trigger="floating"
        subject="Consulta general"
        promptLabel="¿Preguntas? Escríbenos"
      />
    </CartProvider>
  );
}
