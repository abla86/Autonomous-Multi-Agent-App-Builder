import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  X,
  Sparkles,
  ExternalLink,
  Brain,
  Scale
} from "lucide-react";

interface EpistemicTruthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EpistemicTruthModal({ isOpen, onClose }: EpistemicTruthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-0.5">
              Epistemisk Integritetsvern
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Sannhetsgaranti & Anti-Hallusinasjonsmandat
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          I <strong>Terra Incognita</strong> har den kunstige intelligensen og kunnskapsmotoren et 
          <span className="text-amber-400 font-semibold"> ubetinget forbud mot å fremsette usannheter, fabrikasjoner eller pseudovitenskap</span>. 
          Vårt mål er å avsløre intuisjonens feilbarlighet – ikke å skape nye vrangforestillinger.
        </p>

        {/* Core Principles */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <CheckCircle2 className="w-4 h-4" /> 1. Absolutt krav om fagfellevurdert konsensus
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Alle fysiske mekanismer, biologiske årsakskjeder og matematiske prinsipper som presenteres i intuisjonsfellene er forankret i etterprøvbar forskning (f.eks. Kooijmans fysikkgjennombrudd for sykler i <em>Science</em>, Keil & Rozenblits <em>Illusion of Explanatory Depth</em>, og etablerte nevrobiologiske modeller for adenosin og glymfatisk rensing).
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
              <Scale className="w-4 h-4" /> 2. Tydelig merking av hva vitenskapen IKKE vet
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dersom et fenomen er et åpent mysterium (f.eks. Mpemba-effektens mikroskopiske mekanikk, bevissthetens harde problem eller mørk materie), er AI-en pålagt å <strong>si det rett ut</strong> i stedet for å dikte opp spekulative 'fakta'. Vi skiller strengt mellom <em>beviste mekanismer</em> og <em>åpne hypoteser</em>.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" /> 3. Avsløring av populærkulturelle myter
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Når et spørsmål berører utbredte misoppfatninger (som at vi 'bare bruker 10% av hjernen', at kaffe gir ekte energi, eller at en sykkel kun balanserer med gyroskopiske hjul), identifiseres myten og erstattes med den korrekte årsakskjeden.
            </p>
          </div>
        </div>

        {/* Backend System Prompt Verification */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            Aktiv server-instruks til Gemini 3.8 Flash:
          </div>
          <code className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg block border border-slate-800/80 overflow-x-auto">
            "DU HAR STRENGT FORBUD MOT Å GI USANNHETER, FABRIKASJONER ELLER HALLEVEDER. Du skal kun bygge på etablert vitenskapelig konsensus og empiriske data. Hvis noe er et uløst mysterium, MÅ du eksplisitt si at vitenskapen IKKE vet det."
          </code>
        </div>

        {/* Dismiss Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            Forstått – Tilbake til KunnskapsLab
          </button>
        </div>
      </div>
    </div>
  );
}
