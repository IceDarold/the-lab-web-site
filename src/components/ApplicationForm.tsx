import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ScrollReveal } from "./animations/ScrollReveal";
import { Send, Sparkles } from "lucide-react";
import { config } from "../config";

export function ApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    telegram: "",
    motivation: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.backendUrl}${config.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <section id="application-form" className="py-32">
        <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-4xl text-white">
                Заявка отправлена
              </h2>
              <p className="text-xl text-gray-400">
                Свяжемся в Telegram в ближайшие дни
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section id="application-form" className="py-32">
      <div className="container mx-auto px-4 bg-black/65 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl text-white mb-8">
                Готов расти?
              </h2>
              <p className="text-xl text-gray-400">
                Ищем активных участников с амбициями
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <Card className="group bg-gray-900 border-gray-800 hover:border-gray-500 hover:shadow-2xl hover:shadow-gray-900/50 hover-lift border-glow soft-glow hover:strong-glow transition-all-smooth">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-white group-hover:text-gray-100 transition-colors duration-300">Имя</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Как тебя зовут?"
                      className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-400 hover:border-gray-600 focus:bg-gray-950 transition-all duration-400 focus:scale-102 border-glow hover:soft-glow focus:medium-glow"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="telegram" className="text-white group-hover:text-gray-100 transition-colors duration-300">Telegram</Label>
                    <Input
                      id="telegram"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      placeholder="@твой_username"
                      className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-400 hover:border-gray-600 focus:bg-gray-950 transition-all duration-400 focus:scale-102 border-glow hover:soft-glow focus:medium-glow"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="motivation" className="text-white group-hover:text-gray-100 transition-colors duration-300">
                      Что тебя драйвит в ИИ?
                    </Label>
                    <Textarea
                      id="motivation"
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      placeholder="Расскажи о своих интересах и мотивации..."
                      rows={6}
                      className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-400 hover:border-gray-600 focus:bg-gray-950 transition-all duration-400 focus:scale-102 resize-none border-glow hover:soft-glow focus:medium-glow"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-center">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="group w-full bg-white text-black hover:bg-gray-100 hover:scale-110 text-lg py-6 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-white/20 relative overflow-hidden border-2 border-transparent hover:border-gray-300 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!formData.name || !formData.telegram || !formData.motivation || isLoading}
                  >
                    <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                      {isLoading ? 'Thinking...' : 'Отправить заявку'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
