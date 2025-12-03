
import AboutSection from "./components/homepage/AboutSection";
import HeroSection from "./components/homepage/Hero"
import OurStorySection from "./components/homepage/OurStorySection"; // adjust path if needed
import OurProductsSection from "./components/homepage/OurProductsSection"; // adjust path if needed
import CategoriesSection from "./components/homepage/CategoriesSection";
import ContactSection from "./components/homepage/ContactSection";

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <OurStorySection />
            <OurProductsSection />
            <CategoriesSection />
            <ContactSection />

            
        </>
    );
}
/* <AboutSection /> */