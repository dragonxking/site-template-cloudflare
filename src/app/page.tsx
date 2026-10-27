import Link from "next/link";
import { siteConfig } from "@/config/site";
import { localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  const target = localizedPath("/", routing.defaultLocale);
  return (
    <main>
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <p>
        Redirecting to <Link href={target}>{siteConfig.wikiName}</Link>…
      </p>
    </main>
  );
}
