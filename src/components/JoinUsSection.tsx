import { ScrollReveal } from "./animations/ScrollReveal";
import JoinUsConsole from "./JoinUsConsole";

export function JoinUsSection() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl">
          <ScrollReveal>
            <header className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                Interested in Joining Us?
              </h2>
              <p className="text-lg text-gray-400">
                Here is the way to our community.
              </p>
            </header>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <JoinUsConsole />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
