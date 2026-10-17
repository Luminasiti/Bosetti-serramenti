import { BookingProvider } from "@/components/booking/BookingProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { HeroSection } from "@/components/home/HeroSection";
import { FamilySection } from "@/components/home/FamilySection";
import { AluminumWorkshopBanner } from "@/components/home/AluminumWorkshopBanner";
import { ProductsSection } from "@/components/home/ProductsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BookingSection } from "@/components/home/BookingSection";
import { ContactsSection } from "@/components/home/ContactsSection";

export default function HomePage() {
  return (
    <BookingProvider>
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <ReviewsSection />
        <FamilySection />
        <AluminumWorkshopBanner />
        <ProcessSection />
        <BookingSection />
        <ContactsSection />
      </main>
      <Footer />
      <MobileStickyBar />
    </BookingProvider>
  );
}
