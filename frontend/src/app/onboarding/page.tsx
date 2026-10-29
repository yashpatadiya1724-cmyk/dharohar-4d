"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Globe,
  Phone,
  Home,
  Tv,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Plus,
  Minus
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [name, setName] = useState("Rina Patel");
  const [homeType, setHomeType] = useState("2BHK");
  const [members, setMembers] = useState(3);
  const [ward, setWard] = useState("Satellite");
  const [billRs, setBillRs] = useState(2200);
  const [commute, setCommute] = useState("two_wheeler");

  // Appliance states
  const [acCount, setAcCount] = useState(1);
  const [acStar, setAcStar] = useState(4);
  const [geyserCount, setGeyserCount] = useState(1);
  const [fridgeCount, setFridgeCount] = useState(1);
  const [fanCount, setFanCount] = useState(4);
  const [ledCount, setLedCount] = useState(8);
  const [washingCount, setWashingCount] = useState(1);

  // Habit states (0: low, 1: medium, 2: high eco)
  const [waste, setWaste] = useState(1);
  const [plastic, setPlastic] = useState(1);
  const [water, setWater] = useState(1);
  const [consent, setConsent] = useState(true);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const appliances = [
        { type: "fan", count: fanCount, star_rating: 3, wattage: 75, hours_per_day: 8, usual_start_hour: 10 },
        { type: "led_bulb", count: ledCount, star_rating: 5, wattage: 9, hours_per_day: 5, usual_start_hour: 18 },
        { type: "fridge", count: fridgeCount, star_rating: 3, wattage: 150, hours_per_day: 24, usual_start_hour: 0 },
      ];
      if (acCount > 0) {
        appliances.push({ type: "ac", count: acCount, star_rating: acStar, wattage: 1400, hours_per_day: 5, usual_start_hour: 21 });
      }
      if (geyserCount > 0) {
        appliances.push({ type: "geyser", count: geyserCount, star_rating: 3, wattage: 2000, hours_per_day: 0.75, usual_start_hour: 19 });
      }
      if (washingCount > 0) {
        appliances.push({ type: "washing", count: washingCount, star_rating: 3, wattage: 500, hours_per_day: 1, usual_start_hour: 10 });
      }

      const payload = {
        name,
        language,
        home_type: homeType,
        members,
        pincode: "380009",
        ward_id: null,
        monthly_bill_rs: billRs,
        commute_mode: commute,
        appliances,
        habits: {
          waste_segregation: waste,
          plastic_level: plastic,
          water_level: water
        }
      };

      await api.completeOnboarding(payload);
      router.push("/");
    } catch (e: any) {
      alert("Onboarding failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>STEP {step} OF 5</span>
          <span className="text-lifepulse-700">{Math.round((step / 5) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-lifepulse-700 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: LANGUAGE SELECTION */}
      {step === 1 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-lifepulse-100 text-lifepulse-700 flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Select Preferred Language</h2>
            <p className="text-xs text-slate-500">તમારી પસંદગીની ભાષા / अपनी पसंदीदा भाषा चुनें</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "gu", label: "ગુજરાતી (Gujarati)", sub: "અમદાવાદ અને ગુજરાતના નાગરિકો માટે" },
              { id: "hi", label: "हिन्दी (Hindi)", sub: "मिशन लाइफ और दैनिक पर्यावरण कार्य" },
              { id: "en", label: "English", sub: "Standard interface and metrics" },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setLanguage(item.id as any)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  language === item.id
                    ? "bg-lifepulse-50 border-lifepulse-600 ring-2 ring-lifepulse-600/20"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.sub}</div>
                </div>
                {language === item.id && (
                  <CheckCircle2 className="w-5 h-5 text-lifepulse-700" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next: Mobile Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* STEP 2: PHONE & DEMO OTP */}
      {step === 2 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Mobile Verification</h2>
            <p className="text-xs text-slate-500">Quick sign-in for secure household impact ledger</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">10-Digit Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase">OTP Code</label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Demo OTP: 123456
                </span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 tracking-widest text-center font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Household Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: HOUSEHOLD PROFILE */}
      {step === 3 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Home className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Household Profile</h2>
            <p className="text-xs text-slate-500">Establishes your baseline energy benchmark</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Home Type</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["1BHK", "2BHK", "3BHK", "Bungalow", "Flat", "Rented"].map((ht) => (
                  <button
                    key={ht}
                    type="button"
                    onClick={() => setHomeType(ht)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                      homeType === ht
                        ? "bg-lifepulse-50 border-lifepulse-600 text-lifepulse-900 ring-2 ring-lifepulse-600/20"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {ht}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase">Family Members</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMembers(Math.max(1, members - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-sm w-4 text-center">{members}</span>
                <button
                  type="button"
                  onClick={() => setMembers(members + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Ahmedabad Municipal Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900"
              >
                <option value="Satellite">Satellite Ward</option>
                <option value="Navrangpura">Navrangpura Ward</option>
                <option value="Maninagar">Maninagar Ward</option>
                <option value="Naranpura">Naranpura Ward</option>
                <option value="Bopal">Bopal Ward</option>
                <option value="Chandkheda">Chandkheda Ward</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase">Approx Monthly Bill (₹)</label>
                <span className="text-xs font-black text-lifepulse-800">₹{billRs}</span>
              </div>
              <input
                type="range"
                min="500"
                max="8000"
                step="100"
                value={billRs}
                onChange={(e) => setBillRs(Number(e.target.value))}
                className="w-full mt-2 accent-lifepulse-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3.5 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Appliances</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: MAJOR APPLIANCES */}
      {step === 4 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center mx-auto mb-3">
              <Tv className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Appliances Checklist</h2>
            <p className="text-xs text-slate-500">Helps calibrate peak load and star-efficiency drivers</p>
          </div>

          <div className="space-y-3">
            {/* AC */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Air Conditioner (1.5 Ton)</span>
                <div className="text-[11px] text-slate-500">{acStar}-Star BEE Rating</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAcCount(Math.max(0, acCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-xs w-4 text-center">{acCount}</span>
                <button
                  type="button"
                  onClick={() => setAcCount(acCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Geyser */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Water Geyser (2kW)</span>
                <div className="text-[11px] text-slate-500">Heavy shiftable load</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGeyserCount(Math.max(0, geyserCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-xs w-4 text-center">{geyserCount}</span>
                <button
                  type="button"
                  onClick={() => setGeyserCount(geyserCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* LED Bulbs */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">LED Bulbs (9W)</span>
                <div className="text-[11px] text-slate-500">Energy efficient lighting</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLedCount(Math.max(0, ledCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-xs w-4 text-center">{ledCount}</span>
                <button
                  type="button"
                  onClick={() => setLedCount(ledCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(3)}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 py-3.5 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Habits & Consent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 5: DAILY HABITS & FINISH */}
      {step === 5 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Daily Eco Habits</h2>
            <p className="text-xs text-slate-500">Self-attested baseline lifestyle practices</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Waste Segregation</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { val: 0, lbl: "None (Mixed)" },
                  { val: 1, lbl: "Wet / Dry Bins" },
                  { val: 2, lbl: "Composting" },
                ].map((w) => (
                  <button
                    key={w.val}
                    type="button"
                    onClick={() => setWaste(w.val)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                      waste === w.val
                        ? "bg-lifepulse-50 border-lifepulse-600 text-lifepulse-900 ring-2 ring-lifepulse-600/20"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {w.lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Plastic Usage Habit</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { val: 0, lbl: "Regular" },
                  { val: 1, lbl: "Cloth Bag" },
                  { val: 2, lbl: "Zero Plastic" },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPlastic(p.val)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                      plastic === p.val
                        ? "bg-lifepulse-50 border-lifepulse-600 text-lifepulse-900 ring-2 ring-lifepulse-600/20"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {p.lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 rounded-md accent-lifepulse-700"
              />
              <label htmlFor="consent" className="cursor-pointer">
                I consent to participating in Mission LiFE Gujarat Energy Savings Ledger.
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(4)}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
            >
              Back
            </button>
            <button
              disabled={submitting || !consent}
              onClick={handleFinish}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-lifepulse-700 to-lifepulse-600 hover:from-lifepulse-800 hover:to-lifepulse-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{submitting ? "Calculating LiFE Score..." : "Calculate My LiFE Score"}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
