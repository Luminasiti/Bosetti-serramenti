import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { companyData } from "@/data/company";
import "./globals.css";

// Variable Archivo with the width axis: headings are set slightly wide, like the logo lettering.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bosettiserramenti.com"),
  title: "Bosetti Serramenti · Serramenti in alluminio a Montichiari (BS)",
  description:
    "Serramenti in alluminio fatti da noi, a Montichiari. Da padre in figli, da oltre trent'anni. Finestre, alzanti scorrevoli, porte, persiane, vetrine e zanzariere su misura. Prenota online il sopralluogo gratuito.",
  openGraph: {
    title: "Bosetti Serramenti · Serramenti in alluminio fatti da noi, a Montichiari",
    description:
      "Dal taglio del profilo al montaggio a casa tua: sempre le stesse mani. Prenota online il sopralluogo gratuito.",
    locale: "it_IT",
    type: "website",
    siteName: "Bosetti Serramenti",
    images: [{ url: "/images/slider-1.jpg", width: 1210, height: 525 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F4F1",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: companyData.name,
  description: "Produzione e montaggio di serramenti in alluminio su misura a Montichiari (BS).",
  image: "/images/slider-1.jpg",
  email: companyData.email,
  telephone: "+39 030 961983",
  address: {
    "@type": "PostalAddress",
    streetAddress: companyData.address.street,
    postalCode: companyData.address.postalCode,
    addressLocality: companyData.address.city,
    addressRegion: companyData.address.province,
    addressCountry: "IT",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "12:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "14:00",
      closes: "18:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "12:00" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: companyData.googleRating.count,
  },
  sameAs: [companyData.socials.facebook, companyData.socials.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-screen selection:bg-key selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
