"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Trophy,
  Users2,
  Medal,
  MapPin,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall
} from "lucide-react";

export default function CommunityPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"leaderboard" | "quests" | "locator">("leaderboard");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLeaderboard("society").catch(() => []),
      api.getQuests().catch(() => []),
      api.getPlaces().catch(() => [])
    ])
      .then(([lb, q, pl]) => {
        setLeaderboard(lb);
        setQuests(q);
        setPlaces(pl);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Community & Society Competitions</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Community Impact & Quests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Collaborate with your residential society and ward to lead Ahmedabad's Mission LiFE leaderboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setTab("leaderboard")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === "leaderboard"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setTab("quests")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === "quests"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Society Quests
        </button>
        <button
          onClick={() => setTab("locator")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === "locator"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          E-Waste & Solar Map
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {tab === "leaderboard" && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ahmedabad Top Eco-Citizens
            </span>
            <span className="text-xs font-semibold text-lifepulse-700 bg-lifepulse-50 px-2.5 py-1 rounded-full border border-lifepulse-200">
              Satellite Ward Rank #12
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {leaderboard.slice(0, 15).map((user) => {
              const isTop3 = user.rank <= 3;
              const medalColor =
                user.rank === 1
                  ? "text-amber-500 fill-amber-500"
                  : user.rank === 2
                  ? "text-slate-400 fill-slate-400"
                  : "text-amber-700 fill-amber-700";

              return (
                <div
                  key={user.rank}
                  className={`py-3 flex items-center justify-between gap-3 ${
                    user.is_current_user ? "bg-lifepulse-50/80 -mx-3 px-3 rounded-2xl" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-black text-sm text-slate-500">
                      {isTop3 ? (
                        <Medal className={`w-5 h-5 mx-auto ${medalColor}`} />
                      ) : (
                        `#${user.rank}`
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">
                          {user.name}
                        </span>
                        {user.is_current_user && (
                          <span className="text-[10px] font-bold bg-lifepulse-200 text-lifepulse-900 px-1.5 py-0.2 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{user.society_name} • {user.ward_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      {user.points.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      ⚡ {user.kwh_saved} kWh saved
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: SOCIETY QUESTS */}
      {tab === "quests" && (
        <section className="space-y-3">
          {quests.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4 hover:border-lifepulse-400 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {q.scope.toUpperCase()} QUEST
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {q.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{q.days_left}d left</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">
                    Progress: {q.current} / {q.target} {q.metric.toUpperCase()}
                  </span>
                  <span className="text-lifepulse-800 font-bold">
                    {q.progress_percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-lifepulse-600 to-lifepulse-500 h-full rounded-full transition-all"
                    style={{ width: `${q.progress_percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Reward: +{q.reward_points} Society Points</span>
                </div>
                <button
                  onClick={() => alert("Society quest joined! Log your daily actions to contribute.")}
                  className="bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Join Quest
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* TAB 3: LOCATOR */}
      {tab === "locator" && (
        <section className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Authorized Ahmedabad Municipal Corporation (AMC) and GEDA verified recycling hubs.
            </span>
          </div>

          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2 hover:border-lifepulse-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      place.type === "ewaste"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {place.type === "ewaste" ? "E-Waste Drop Hub" : "GEDA Solar Installer"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {place.name}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-snug">
                  {place.address}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="text-[11px] font-medium text-slate-500">
                    🕒 {place.hours}
                  </span>
                  <a
                    href={`tel:${place.contact}`}
                    className="inline-flex items-center gap-1 font-bold text-lifepulse-700 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{place.contact}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
