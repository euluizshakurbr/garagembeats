import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import AudioPlayerProvider from "@/components/audio/AudioPlayerProvider";
import SiteFooter from "@/components/SiteFooter";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn
    ? "Garagem Beats | Music for car lovers"
    : "Garagem Beats | Música pra quem ama carro";
  const description = isEn
    ? "Exclusive car-inspired tracks, copyright-free for your videos — or order a 100% custom song for your build."
    : "Compre trilhas exclusivas do catálogo ou peça uma música 100% personalizada inspirada no seu carro.";

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ),
    title: { default: title, template: "%s | Garagem Beats" },
    description,
    openGraph: {
      type: "website",
      siteName: "Garagem Beats",
      title,
      description,
      locale: isEn ? "en_US" : "pt_BR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AudioPlayerProvider>
            {children}
            <SiteFooter />
          </AudioPlayerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
