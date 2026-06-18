import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedCollections from "./components/FeaturedCollections";
import BestSellers from "./components/BestSellers";
import Promotions from "./components/Promotions";
import BrandStory from "./components/BrandStory";
import WhyChooseUs from "./components/WhyChooseUs";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Test4Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturedCollections />
        <BestSellers />
        <Promotions />
        <BrandStory />
        <WhyChooseUs />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
