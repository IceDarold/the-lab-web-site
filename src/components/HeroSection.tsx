import { useState } from "react";
import { Button } from "./ui/button";
import { TypewriterText } from "./animations/TypewriterText";
import { ScrollReveal } from "./animations/ScrollReveal";

export function HeroSection() {
  const [showContent, setShowContent] = useState(false);

  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="container mx-auto px-4 py-20 relative z-10 bg-black/70 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.45)]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl text-white leading-tight hero-glow">
              <TypewriterText 
                text="Горишь ИИ?"
                speed={100}
                onComplete={() => setShowContent(true)}
              />
            </h1>
            {showContent && (
              <ScrollReveal delay={0.3}>
                <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Сообщество студентов и школьников, которые создают AI-проекты, побеждают в олимпиадах и меняют мир
                </p>
              </ScrollReveal>
            )}
          </div>
          {showContent && (
            <ScrollReveal delay={0.8}>
              <Button 
                size="lg" 
                className="group bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/20 relative overflow-hidden border-2 border-transparent hover:border-gray-300 mega-glow"
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                  Присоединиться
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
