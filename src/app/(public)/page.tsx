import { Navbar } from "./_components/navbar";
import Hero from "./_components/hero";
import Product from "./_components/product";
import WebDemo from "./_components/web-demo";
import Features from "./_components/features";
import Users from "./_components/users";
import Roadmap from "./_components/roadmap";
import WaitingList from "./_components/waiting-list";
import Footer from "./_components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <Navbar />
      <Hero />
      <Product />
      <WebDemo />
      <Features />
      <Users />
      <Roadmap />
      <WaitingList />
      <Footer />
    </main>
  );
}
