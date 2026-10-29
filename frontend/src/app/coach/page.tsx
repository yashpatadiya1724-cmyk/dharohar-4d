"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Bot, Send, Sparkles, BookOpen, Plus, Check } from "lucide-react";

interface Message {
  sender: "user" | "coach";
  text: string;
  sources?: string[];
  actionId?: string;
  actionTitle?: string;
}

export default function AICoachPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "coach",
      text:
        language === "gu"
          ? "નમસ્તે! હું તમારો LiFE સસ્ટેઇનેબિલિટી કોચ છું. તમે એસી તાપમાન, સોલાર સબસિડી, પીક-લોડ શિફ્ટિંગ અથવા કચરા વ્યવસ્થાપન વિશે કંઈ પણ પૂછી શકો છો."
          : language === "hi"
          ? "नमस्ते! मैं आपका LiFE सस्टेनेबिलिटी कोच हूँ। आप मुझसे एसी तापमान, सोलर सब्सिडी, पीक-लोड शिफ्टिंग या ई-कचरे के बारे में कुछ भी पूछ सकते हैं।"
          : "Hello! I am your LiFE Sustainability Coach. Ask me about AC temperature rules, PM Surya Ghar solar subsidy in Gujarat, peak load shifting, or e-waste recycling.",
      sources: ["Mission LiFE National Framework", "Bureau of Energy Efficiency (BEE)"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedActionId, setAddedActionId] = useState<string | null>(null);

  const sampleQuestions = [
    "Why should I set AC temperature to 24°C?",
    "What is PM Surya Ghar rooftop solar subsidy in Gujarat?",
    "How does off-peak geyser shifting help the grid?",
    "What should I do with RO water purifier reject water?",
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput("");
    const userMsg: Message = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.askCoach(q, language);
      const coachMsg: Message = {
        sender: "coach",
        text: res.answer,
        sources: res.sources,
        actionId: res.suggested_action_id,
        actionTitle: res.suggested_action_title,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: "I am having trouble connecting to the knowledge base right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = (actId: string) => {
    setAddedActionId(actId);
    setTimeout(() => setAddedActionId(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[750px] space-y-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 mb-1">
          <Bot className="w-3.5 h-3.5 text-emerald-700" />
          <span>RAG-Grounded AI Assistant</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t("coach.title")}
        </h1>
        <p className="text-xs text-slate-500">{t("coach.subtitle")}</p>
      </div>

      {/* Quick sample prompt pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="shrink-0 text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.sender === "user"
                  ? "bg-lifepulse-700 text-white rounded-tr-xs"
                  : "bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-xs space-y-2.5"
              }`}
            >
              <p>{m.text}</p>

              {/* Citations */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span>{t("coach.sources")}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Pill */}
              {m.actionId && (
                <div className="pt-1">
                  <button
                    onClick={() => handleAddAction(m.actionId!)}
                    className="w-full text-left inline-flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{m.actionTitle || "Add to My Daily Plan"}</span>
                    </span>
                    {addedActionId === m.actionId ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Added!
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                        + Plan
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 animate-spin text-lifepulse-600" />
            <span>Consulting Mission LiFE knowledge base...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("coach.placeholder")}
          className="flex-1 bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-lifepulse-600 shadow-2xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-lifepulse-700 hover:bg-lifepulse-800 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
