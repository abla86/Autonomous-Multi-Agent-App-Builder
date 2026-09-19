import React, { useState } from 'react';
import { Sparkles, Send, Lightbulb, BookOpen, Check } from 'lucide-react';
import { TopicProposal, TopicDossier } from '../types';

interface SuggestTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (proposal: TopicProposal) => void;
  onViewGeneratedDossier: (dossier: TopicDossier) => void;
}

export const SuggestTopicModal: React.FC<SuggestTopicModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  onViewGeneratedDossier,
}) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vitenskap & Historie');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDossier, setGeneratedDossier] = useState<TopicDossier | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/explore-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
        }),
      });

      const dossierData: TopicDossier = await res.json();
      setGeneratedDossier(dossierData);

      const newProposal: TopicProposal = {
        id: `prop-${Date.now()}`,
        title: topic,
        description: description || dossierData.coreFact || 'Etterlyst av arkivar',
        category,
        author: 'Deg (Arkivar)',
        votes: 1,
        status: 'avdekket',
        createdAt: new Date().toISOString().split('T')[0],
        dossier: dossierData,
      };

      onSubmitSuccess(newProposal);
    } catch (err) {
      console.error('Error generating dossier:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F1115]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#16181D] border border-[#2D3139] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#2D3139] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#E0E2E6]">
              Foreslå et Tema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-mono text-lg"
          >
            ✕
          </button>
        </div>

        {!generatedDossier ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Skriv inn et fenomen, en person, en uforklart hendelse eller en oppfinnelse du vil at arkivet skal avdekke. Vår kuratormodell undersøker sjeldne kilder for deg med en gang!
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5">
                Tema / Mysterium / Konsept
              </label>
              <input
                type="text"
                required
                placeholder="F.eks: Gloria-fenomenet i atmosfæren, Tartaria-hypotesen, Damaskus-stål..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 bg-[#0F1115] border border-[#2D3139] rounded text-sm text-[#E0E2E6] placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-[#0F1115] border border-[#2D3139] rounded text-xs text-[#E0E2E6] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Vitenskap & Fysikk">Vitenskap & Fysikk</option>
                <option value="Glemt Historie">Glemt Historie</option>
                <option value="Natur & Biologi">Natur & Biologi</option>
                <option value="Kunst & Pigmenter">Kunst & Pigmenter</option>
                <option value="Koder & Kryptografi">Koder & Kryptografi</option>
                <option value="Glemte Oppfinnelser">Glemte Oppfinnelser</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Hva nysgjerriggjør deg med dette? (Valgfritt)
              </label>
              <textarea
                rows={3}
                placeholder="Hvor hørte du om dette, eller hva lurer du spesifikt på?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-[#0F1115] border border-[#2D3139] rounded text-xs text-[#E0E2E6] placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#F2D06B] disabled:opacity-50 text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Arkivet dypdykker i kildene...' : 'Send forslag & Avdekk Dossier'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Check className="w-4 h-4" /> Forskningsdossier er generert og arkivert!
            </div>

            <div className="bg-[#0F1115] p-4 rounded border border-[#2D3139] space-y-2">
              <span className="text-[10px] text-[#D4AF37] uppercase font-mono tracking-wider">
                Dossier: {generatedDossier.category} • {generatedDossier.rarityScore}% sjeldenhet
              </span>
              <h3 className="text-base font-serif font-bold text-[#E0E2E6]">
                {generatedDossier.title}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-serif">
                {generatedDossier.coreFact}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onViewGeneratedDossier(generatedDossier);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Åpne Hele Dossieret
              </button>
              <button
                onClick={() => {
                  setGeneratedDossier(null);
                  setTopic('');
                  setDescription('');
                }}
                className="px-4 py-2.5 bg-[#1C1E24] hover:bg-[#2D3139] border border-[#2D3139] text-gray-300 text-xs rounded transition-colors cursor-pointer"
              >
                Foreslå enda et tema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
