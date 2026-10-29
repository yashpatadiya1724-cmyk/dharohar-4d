"use client";

import React, { useState } from "react";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const VoiceActionInput: React.FC<{
  onActionDetected?: (actionPhrase: string) => void;
}> = ({ onActionDetected }) => {
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedAction, setDetectedAction] = useState<string | null>(null);

  const startVoiceRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate quick voice interaction for demo
      simulateVoiceDemo();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
        setTranscript("");
        setDetectedAction(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processSpokenText(text);
      };

      recognition.onerror = () => {
        simulateVoiceDemo();
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      simulateVoiceDemo();
    }
  };

  const simulateVoiceDemo = () => {
    setListening(true);
    setTimeout(() => {
      const demoPhrases = {
        gu: "આજે મેં એસી 24 ડિગ્રી પર ચલાવ્યું અને ગીઝર ઑફ-પીક શિફ્ટ કર્યું",
        hi: "आज मैंने एसी 24 डिग्री पर चलाया और गीज़र रात में शिफ्ट किया",
        en: "Set AC to 24 degrees and shifted geyser to off-peak",
      };
      const text = demoPhrases[language as "gu" | "hi" | "en"] || demoPhrases.en;
      setTranscript(text);
      processSpokenText(text);
      setListening(false);
    }, 1400);
  };

  const processSpokenText = (text: string) => {
    const tLower = text.toLowerCase();
    let action = "Set AC to 24°C / AC 24 ડિગ્રી પર ચલાવો";
    if (tLower.includes("geyser") || tLower.includes("ગીઝર") || tLower.includes("गीज़र")) {
      action = "Shift Geyser to Off-Peak (10 PM) / ગીઝર ઑફ-પીક ચલાવો";
    } else if (tLower.includes("bag") || tLower.includes("થેલી") || tLower.includes("थैला")) {
      action = "Carry Reusable Cloth Bag / કાપડની થેલી વાપરો";
    }
    setDetectedAction(action);
    onActionDetected?.(action);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-600 text-white">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Voice Action Logging (Mission LiFE Voice)
            </h4>
            <p className="text-[10px] text-slate-500">
              Speak in Gujarati, Hindi or English to log your daily actions hands-free
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={startVoiceRecognition}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            listening
              ? "bg-rose-500 text-white animate-pulse"
              : "bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95"
          }`}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{listening ? "Listening..." : "Speak Action"}</span>
        </button>
      </div>

      {transcript && (
        <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Heard:</span>
          <p className="font-semibold text-slate-800 italic">"{transcript}"</p>
          {detectedAction && (
            <div className="pt-1 flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Matched: {detectedAction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
