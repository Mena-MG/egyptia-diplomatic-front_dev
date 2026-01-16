import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Statistics from "@/components/Statistics";
import Activities from "@/components/Activities";
import JoinForm from "@/components/JoinForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>الجبهة الدبلوماسية المصرية | Egyptian Diplomatic Front</title>
        <meta
          name="description"
          content="الجبهة الدبلوماسية المصرية الشبابية - كيان شبابي تابع لوزارة الشباب والرياضة يهدف لتعزيز الوعي السياسي والدبلوماسي لدى الشباب المصري"
        />
        <meta
          name="keywords"
          content="الجبهة الدبلوماسية المصرية, دبلوماسية شبابية, وزارة الشباب والرياضة, شباب مصر, Egyptian Diplomatic Front"
        />
        <meta property="og:title" content="الجبهة الدبلوماسية المصرية" />
        <meta
          property="og:description"
          content="كيان شبابي تابع لوزارة الشباب والرياضة يهدف لتعزيز الوعي السياسي والدبلوماسي"
        />
        <meta property="og:type" content="website" />
        <html lang="ar" dir="rtl" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Statistics />
          <Activities />
          <JoinForm />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
