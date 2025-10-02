import { ScrollReveal } from "./animations/ScrollReveal";
import { FadeInStagger } from "./animations/FadeInStagger";

export function ApproachSection() {
  const principles = [
    {
      title: "Лучший способ научиться — научить другого",
      description: "Мы активно делимся знаниями, проводим внутренние лекции и помогаем друг другу. Каждый из нас — одновременно и ученик, и учитель."
    },
    {
      title: "Дисциплина — это наш импульс", 
      description: "Наши регулярные встречи и обязательства — это пульс The Lab. Именно эта регулярность создает общий ритм и импульс, который не дает нам остановиться и помогает двигаться вперед, даже когда пропадает мотивация."
    },
    {
      title: "Hard Work Pays Off",
      description: "Мы не верим в легкие пути. Настоящий драйв и результат рождаются в часах, потраченных на отладку кода, в сложной математике, которая наконец поддалась. Мы знаем, что будет трудно, и именно поэтому этим занимается не каждый. Каждое твоё усилие сегодня — это шаг, который отделяет нас от всех остальных."
    },
    {
      title: "Задавай глубокие вопросы",
      description: "Наш подход — это глубина. Мы здесь не для того, чтобы стать операторами «черных ящиков», просто вызывая функции из библиотек. Мы стремимся стать архитекторами интеллектуальных систем. Это значит, что мы не останавливаемся на вопросе «Как это использовать?», а всегда идем дальше: «Почему это работает именно так?». Мы погружаемся в математику, разбираем алгоритмы до основания и оспариваем их фундаментальные принципы. Потому что мы убеждены: настоящие прорывы и способность менять мир рождаются не из умения пользоваться готовыми инструментами, а из такого глубокого их понимания, которое позволяет создавать инструменты следующего поколения."
    }
  ];

  return (
    <section id="approach" className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl text-white mb-20 text-center">
              Наша философия
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
