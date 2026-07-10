declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Dispara um evento do Pixel da Meta, se o pixel estiver carregado
// (só carrega após o usuário aceitar os cookies).
export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options) {
      window.fbq("track", event, params, options);
    } else {
      window.fbq("track", event, params);
    }
  }
}
