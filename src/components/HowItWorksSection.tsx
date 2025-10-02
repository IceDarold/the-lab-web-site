import { ScrollReveal } from "./animations/ScrollReveal";
import { FadeInStagger } from "./animations/FadeInStagger";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Заполняешь анкету",
      description: "Рассказываешь, что тебя зажигает в ИИ"
    },
    {
      title: "Проходишь интервью",
      description: "Рассказываешь про свой бэкграунд, цели и амбиции."
    },
    {
      title: "Начинаешь делать",
      description: "Участвуешь в митапах и готовишься к соревнованиям"
    }
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl text-white mb-20 text-center">
              Как попасть к нам
            </h2>
          </ScrollReveal>
          
          <FadeInStagger staggerDelay={0.3}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-6 group hover:translate-x-4 hover:bg-gray-950/40 transition-all duration-500 ease-out cursor-default p-6 rounded-lg border border-transparent hover:border-gray-800"
              >
                <div className="text-3xl text-gray-500 mt-1 group-hover:text-white group-hover:scale-110 transition-all duration-400">
                  0{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-white mb-2 group-hover:text-gray-100 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
