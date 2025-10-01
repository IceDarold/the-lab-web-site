import { ScrollReveal } from "./animations/ScrollReveal";
import { FadeInStagger } from "./animations/FadeInStagger";

export function ApproachSection() {
  const principles = [
    {
      title: "Обучение в действии",
      description: "Берём проект и решаем. Теорию изучаем в процессе."
    },
    {
      title: "Сила в команде", 
      description: "Обсуждаем идеи, советуемся, поддерживаем друг друга."
    },
    {
      title: "Общая цель — рост",
      description: "Соревнуемся с задачами, а не друг с другом."
    }
  ];

  return (
    <section id="approach" className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl text-white mb-20 text-center">
              Растём через действие
            </h2>
          </ScrollReveal>
          
          <FadeInStagger staggerDelay={0.2}>
            {principles.map((principle, index) => (
              <div 
                key={index} 
                className="group border-l-4 border-gray-800 pl-8 py-6 hover:border-gray-400 hover:translate-x-3 hover:bg-gray-950/30 transition-all duration-500 ease-out cursor-default rounded-r-lg border-glow soft-glow hover:medium-glow"
              >
                <h3 className="text-2xl text-white mb-4 group-hover:text-gray-100 transition-colors duration-300 text-glow-soft">
                  {principle.title}
                </h3>
                <p className="text-xl text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {principle.description}
                </p>
              </div>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
