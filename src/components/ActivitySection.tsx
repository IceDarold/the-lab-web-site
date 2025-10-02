import { ScrollReveal } from "./animations/ScrollReveal";
import { FadeInStagger } from "./animations/FadeInStagger";

export function ActivitySection() {
  const activities = [
    "Диффузия для виртуальной примерки одежды",
    "Персональный асистент на базе RAG, который знает все про тебя и помогвет управлять жизнью", 
    "Умная камера для магазинов, анализирующая поведение пользоваталей и их предпочтения",
    "Подготовка к IOAI, FAIO, ВСОШ, НТО",
    "Участие в kaggle-соренованиях, хакатонах и путь к призовым местам",
    "Разборы статей с ArXiv с воспроизведением кода"
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl text-white mb-20">
              Чем занимаемся
            </h2>
          </ScrollReveal>
          
          <FadeInStagger 
            staggerDelay={0.1}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className="group text-left p-8 border border-gray-800 hover:border-gray-500 hover:bg-gray-900/70 hover-lift rounded-lg shadow-lg hover:shadow-2xl hover:shadow-gray-900/50 border-glow soft-glow hover:strong-glow transition-all-smooth"
              >
                <p className="text-lg text-gray-300 group-hover:text-white transition-colors duration-300">
                  {activity}
                </p>
                <div className="w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-300 group-hover:w-full transition-all duration-500 ease-out mt-4 shimmer"></div>
              </div>
            ))}
          </FadeInStagger>
          
          <ScrollReveal delay={0.8}>
            <div className="mt-20 text-center">
              <p className="text-xl text-gray-400">
                45+ участников, 12 команд
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
