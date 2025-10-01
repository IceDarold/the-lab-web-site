import { HeroSection } from "./components/HeroSection";
import { ApproachSection } from "./components/ApproachSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { ActivitySection } from "./components/ActivitySection";
import { BenefitsSection } from "./components/BenefitsSection";
import { ApplicationForm } from "./components/ApplicationForm";
import { InteractiveBackground } from "./components/animations/InteractiveBackground";

export default function App() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <InteractiveBackground />
      <div className="relative z-10">
        <HeroSection />
        <ApproachSection />
        <HowItWorksSection />
        <ActivitySection />
        <BenefitsSection />
        <ApplicationForm />
      </div>
    </div>
  );
}
