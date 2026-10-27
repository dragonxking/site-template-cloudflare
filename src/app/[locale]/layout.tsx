import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/analytics";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/site";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = siteConfig.url;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as unknown as { metadata: { title: string; description: string; keywords?: string } };
  const image = `${siteUrl}${siteConfig.images.hero}`;
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: messages.metadata.title, template: "%s" },
    description: messages.metadata.description,
    ...(messages.metadata.keywords ? { keywords: messages.metadata.keywords } : {}),
    openGraph: { type: "website", locale, url: siteUrl, siteName: siteConfig.wikiName, images: [{ url: image }] },
    twitter: { card: "summary_large_image", images: [image] },
    ...(adsenseId ? { other: { "google-adsense-account": adsenseId } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages({ locale });
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.wikiName,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.images.logo}`,
    image: `${siteUrl}${siteConfig.images.hero}`,
  };

  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <html lang={locale} className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {adsenseId && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          />
        )}
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <JsonLd data={organization} />
            <SiteHeader locale={locale} />
            {children}
            <SiteFooter locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
