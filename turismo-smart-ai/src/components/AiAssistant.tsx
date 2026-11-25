import { ExternalLink, MapPin, Send, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';
import type { ChatTurn, TouristPlace } from '../types/place.ts';
import { getGoogleMapsPlaceUrl } from '../utils/maps.ts';

interface AiAssistantProps {
  places: TouristPlace[];
  onSelectPlaceOnMap: (place: TouristPlace) => void;
}

const TEST_PROMPTS = [
  '¿Qué lugares registrados puedo visitar con 50.000 Gs.?',
  '¿Qué museos del catálogo puedo visitar?',
  '¿Puedes sugerir un itinerario con los lugares registrados?',
];

function renderFormattedLine(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function FormattedReply({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-stone-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <p key={idx} className="pl-4 relative">
              <span aria-hidden="true" className="absolute left-0 text-stone-400">
                ·
              </span>
              {renderFormattedLine(trimmed.slice(2))}
            </p>
          );
        }
        return <p key={idx}>{renderFormattedLine(trimmed)}</p>;
      })}
    </div>
  );
}

export function AiAssistant({ places, onSelectPlaceOnMap }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      content:
        'Hola. Soy el asistente de Turismo Smart AI y consulto en tiempo real los lugares, horarios y costos en Guaraníes guardados en la base de datos. Elige una consulta rápida o escribe tu pregunta.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg(null);
    const userTurn: ChatTurn = { role: 'user', content: trimmed };
    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory.slice(-8).map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        referencedPlaceIds?: string[];
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'No se pudo obtener respuesta del asistente.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply!,
          referencedPlaceIds: data.referencedPlaceIds || [],
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el asistente.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setErrorMsg(null);
    setMessages([
      {
        role: 'assistant',
        content:
          'Conversación reiniciada. Consulta presupuestos en Guaraníes, museos disponibles o itinerarios basados en el catálogo actual.',
      },
    ]);
  };

  return (
    <section id="asistente" className="py-12 lg:py-16 bg-[#FBF9F5] border-b border-stone-200">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500 font-medium">
                Asistente inteligente · Gemini API + Datos reales
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight">
                Planificador cultural en tiempo real
              </h2>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                Cada respuesta consulta los {places.length} registros activos de la base de datos
                para calcular presupuestos en Guaraníes, filtrar museos y armar itinerarios reales.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <p className="text-xs font-medium text-stone-500 mb-3">
                Consultas sugeridas para prueba
              </p>
              <div className="flex flex-col gap-2">
                {TEST_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(prompt)}
                    className="text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-800 bg-white hover:bg-[#F4EFE6] border border-stone-200 hover:border-stone-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 flex flex-col h-[540px]">
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  Conversación con Turismo Smart AI
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((turn, idx) => {
                const referenced = (turn.referencedPlaceIds || [])
                  .map((id) => places.find((p) => p.id === id))
                  .filter((p): p is TouristPlace => Boolean(p));

                return (
                  <div
                    key={idx}
                    className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-4 py-3 ${
                        turn.role === 'user'
                          ? 'bg-[#14532D] text-[#FBF9F5] text-sm'
                          : 'bg-[#F7F4EE] border border-stone-200 text-stone-800'
                      }`}
                    >
                      {turn.role === 'user' ? (
                        <p className="leading-relaxed">{turn.content}</p>
                      ) : (
                        <>
                          <FormattedReply text={turn.content} />
                          {referenced.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex flex-wrap gap-2">
                              {referenced.map((place) => (
                                <div
                                  key={place.id}
                                  className="inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-md px-2.5 py-1 text-xs"
                                >
                                  <button
                                    type="button"
                                    onClick={() => onSelectPlaceOnMap(place)}
                                    className="inline-flex items-center gap-1 font-medium text-[#14532D] hover:underline cursor-pointer"
                                  >
                                    <MapPin className="w-3 h-3" />
                                    <span>{place.nombre}</span>
                                  </button>
                                  <span aria-hidden="true" className="text-stone-300">
                                    |
                                  </span>
                                  <a
                                    href={getGoogleMapsPlaceUrl(place.latitud, place.longitud)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-stone-600 hover:text-stone-900"
                                    title="Ver en Google Maps"
                                  >
                                    <span>Maps</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F7F4EE] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-500">
                    Consultando el catálogo y redactando recomendación...
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  {errorMsg}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-3.5 border-t border-stone-200 bg-[#FBF9F5] rounded-b-xl flex items-center gap-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre costos en Gs., museos o itinerarios..."
                disabled={loading}
                className="flex-1 bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
