import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Table, Target, Loader2, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Mode = 'pros_cons' | 'table' | 'swot';

const modes: { id: Mode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'pros_cons', label: 'Avantages / Inconvénients', icon: Scale, desc: 'Liste des points forts et faibles' },
  { id: 'table', label: 'Tableau Comparatif', icon: Table, desc: 'Comparaison structurée des options' },
  { id: 'swot', label: 'Analyse SWOT', icon: Target, desc: 'Forces, Faiblesses, Opportunités, Menaces' },
];

export default function App() {
  const [dilemma, setDilemma] = useState('');
  const [mode, setMode] = useState<Mode>('pros_cons');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const analyzeDecision = async () => {
    if (!dilemma.trim() || isLoading) return;
    setIsLoading(true);
    setResult('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = "Tu es un assistant pragmatique et analytique en prise de décision. Fournis une analyse claire, impartiale et structurée. Réponds toujours en français.";
      
      let promptStr = "";
      if (mode === 'pros_cons') {
        promptStr = `Je dois prendre une décision concernant : "${dilemma}". Fais-moi une liste détaillée des avantages et des inconvénients, suivie d'une brève recommandation ou conclusion. Utilise le format Markdown.`;
      } else if (mode === 'table') {
        promptStr = `Je dois prendre une décision concernant : "${dilemma}". Fais-moi un tableau comparatif complet montrant les facteurs clés, les avantages et les inconvénients des différentes options possibles liées à ce dilemme. Inclus une réflexion finale. Utilise le format Markdown.`;
      } else if (mode === 'swot') {
        promptStr = `Je dois prendre une décision concernant : "${dilemma}". Fais-moi une analyse SWOT formelle détaillée (Forces, Faiblesses, Opportunités, Menaces) pour m'aider. Utilise le format Markdown.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: promptStr,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      setResult(response.text || '');
    } catch (error) {
      console.error(error);
      setResult("Une erreur s'est produite lors de l'analyse de votre décision. Veuillez vérifier votre clé API ou réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDilemma('');
    setResult('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Input area */}
        <motion.div 
          className="lg:col-span-5 flex flex-col space-y-6"
          layout
        >
          <div className="space-y-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-sm">TB</span>
              THE TIE BREAKER
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-medium">
              Décrivez votre dilemme et laissez l'IA vous éclairer
            </p>
          </div>

          <div className="bg-[#18181B] p-6 rounded-xl border border-[#27272A] space-y-6">
            <div className="space-y-3">
              <label htmlFor="dilemma" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Quelle est votre décision ?
              </label>
              <textarea
                id="dilemma"
                value={dilemma}
                onChange={(e) => setDilemma(e.target.value)}
                placeholder="Ex : Dois-je acheter un vélo électrique ou continuer à utiliser les transports en commun ?"
                className="w-full p-4 h-32 rounded-xl bg-[#0A0A0B] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Format d'analyse
              </label>
              <div className="grid grid-cols-1 gap-3">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex items-center p-4 rounded-xl border text-left transition-all ${
                        isActive 
                          ? 'border-indigo-500/50 bg-indigo-500/10' 
                          : 'border-[#27272A] hover:border-[#3F3F46] bg-[#0A0A0B]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600' : 'bg-[#18181B] border border-[#27272A] text-zinc-400'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                      </div>
                      <div className="ml-4">
                        <div className={`font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {m.label}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-indigo-300' : 'text-zinc-500'}`}>
                          {m.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={analyzeDecision}
              disabled={!dilemma.trim() || isLoading}
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20 text-xs uppercase tracking-widest"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  Analyser la décision
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right Column - Results area */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="popLayout">
            {!result && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[#18181B] border border-[#27272A] border-dashed rounded-xl"
              >
                <div className="w-16 h-16 bg-[#0A0A0B] border border-[#27272A] rounded-full flex items-center justify-center mb-6">
                  <Scale className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Prêt à trancher</h3>
                <p className="text-zinc-500 max-w-sm text-xs">
                  Entrez votre dilemme à gauche, choisissez un format d'analyse et découvrez la meilleure voie à suivre.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#18181B] rounded-xl border border-[#27272A] p-8"
              >
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 border-4 border-[#27272A] rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Réflexion en cours...
                </div>
                <div className="text-zinc-500 text-xs">
                  L'IA pèse le pour et le contre.
                </div>
              </motion.div>
            )}

            {result && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-[#18181B] rounded-xl shadow-lg border border-[#27272A] overflow-hidden flex flex-col h-full max-h-[85vh]"
              >
                <div className="p-5 border-b border-[#27272A] bg-[#1C1C1F] flex justify-between items-center sticky top-0 z-10">
                  <div className="flex-1 flex flex-col items-start pr-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Dilemme actuel</div>
                    <div className="text-lg font-medium text-indigo-400 font-serif italic line-clamp-1 text-left w-full">"{dilemma}"</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">AI ANALYZED</span>
                    <button
                      onClick={handleReset}
                      className="p-1.5 bg-[#0A0A0B] border border-[#27272A] hover:border-[#3F3F46] text-zinc-400 rounded-lg transition-colors flex ml-2"
                      title="Nouvelle décision"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto flex-grow">
                  <div className="markdown-body">
                    <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
