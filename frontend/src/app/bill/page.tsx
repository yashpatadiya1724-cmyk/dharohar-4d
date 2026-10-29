"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  FileText,
  Upload,
  CheckCircle2,
  Scan,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function BillOCRPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Sample Gujarati Bill Simulation
  const handleSimulateSampleBill = () => {
    setScanning(true);
    setTimeout(() => {
      setExtractedData({
        discom: "Torrent Power Ahmedabad",
        consumer_no: "TP-AHM-984210",
        billing_period: "01/09/2026 - 30/09/2026",
        units_kwh: 242.0,
        amount_rs: 1815.0,
        tariff: "RGPS - Domestic Residential",
        ocr_confidence: 0.94,
      });
      setScanning(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleSimulateSampleBill();
    }
  };

  const handleConfirmVerified = () => {
    setVerifiedSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 mb-2">
          <Scan className="w-3.5 h-3.5 text-blue-600" />
          <span>F10: Smart Bill OCR & Proof Verification</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Electricity Bill OCR Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your DISCOM bill (Torrent Power or UGVCL) to verify your baseline kWh and earn 50 LiFE points.
        </p>
      </div>

      {/* Upload Box */}
      {!extractedData && (
        <section className="bg-white rounded-3xl p-6 border-2 border-dashed border-slate-300 text-center space-y-4 hover:border-lifepulse-500 transition-colors shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            {scanning ? (
              <Scan className="w-8 h-8 text-lifepulse-600 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-600" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {scanning ? "Processing OCR via Tesseract & PaddleOCR..." : "Upload Bill Photo or PDF"}
            </h3>
            <p className="text-xs text-slate-400">
              Supports JPEG, PNG, or PDF bills up to 5MB
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
              Choose File
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleSimulateSampleBill}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Use Sample Ahmedabad Bill (Demo)
            </button>
          </div>
        </section>
      )}

      {/* Extracted Fields Confirmation */}
      {extractedData && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                DISCOM Detected
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {extractedData.discom}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{(extractedData.ocr_confidence * 100).toFixed(0)}% Confidence</span>
            </span>
          </div>

          {verifiedSuccess ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">
                Bill Verified & Recorded in Impact Ledger!
              </h4>
              <p className="text-xs text-emerald-800">
                +50 Points awarded. Your baseline footprint is now officially synchronized with Torrent Power AMC grid records.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Consumer No</span>
                  <input
                    type="text"
                    value={extractedData.consumer_no}
                    onChange={(e) => setExtractedData({ ...extractedData, consumer_no: e.target.value })}
                    className="w-full font-bold text-slate-900 mt-0.5 bg-transparent"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Billing Period</span>
                  <input
                    type="text"
                    value={extractedData.billing_period}
                    onChange={(e) => setExtractedData({ ...extractedData, billing_period: e.target.value })}
                    className="w-full font-bold text-slate-900 mt-0.5 bg-transparent"
                  />
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold uppercase">Units Consumed</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={extractedData.units_kwh}
                      onChange={(e) => setExtractedData({ ...extractedData, units_kwh: Number(e.target.value) })}
                      className="w-16 font-black text-amber-950 bg-transparent text-sm"
                    />
                    <span className="text-xs text-amber-800 font-medium">kWh</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Bill Amount</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-emerald-800 font-bold">₹</span>
                    <input
                      type="number"
                      value={extractedData.amount_rs}
                      onChange={(e) => setExtractedData({ ...extractedData, amount_rs: Number(e.target.value) })}
                      className="w-20 font-black text-emerald-950 bg-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setExtractedData(null)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleConfirmVerified}
                  className="flex-1 py-3.5 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Verify Bill & Earn 50 Points</span>
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
