import { ScrollReveal } from "./animations/ScrollReveal";
import { FadeInStagger } from "./animations/FadeInStagger";

export function BenefitsSection() {
  const benefits = [
    "Сильное окружение",
    "Реальный опыт", 
    "Взаимная поддержка",
    "Амбициозные цели"
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl text-white mb-20">
              Что получишь
            </h2>
          </ScrollReveal>
          
          <FadeInStagger staggerDelay={0.2}>
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group text-2xl text-gray-300 hover:text-white interactive-transform cursor-default py-4 px-6 rounded-lg hover:bg-gray-900/40 border border-transparent hover:border-gray-700 border-glow soft-glow hover:medium-glow pulse-glow"
              >
                <span className="relative text-glow-soft">
                  {benefit}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-gray-400 group-hover:w-full transition-all duration-500 ease-out shimmer"></div>
                </span>
              </div>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
