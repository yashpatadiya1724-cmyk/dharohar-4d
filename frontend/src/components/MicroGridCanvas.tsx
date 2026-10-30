"use client";

import React, { useEffect, useRef, useState } from "react";

export interface MicroGridNode {
  id: string;
  name: string;
  type: string;
  solar_kw: number;
  current_generation_kw: number;
  current_load_kw: number;
  net_export_kw: number;
  battery_soc_pct: number;
  x: number;
  y: number;
}

interface MicroGridCanvasProps {
  nodes: MicroGridNode[];
  onSelectNode?: (node: MicroGridNode | null) => void;
}

interface Particle {
  fromNodeId: string;
  toNodeId: string;
  progress: number;
  speed: number;
  color: string;
}

export default function MicroGridCanvas({ nodes, onSelectNode }: MicroGridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    // Scale canvas for crisp display
    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = 500;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize particles flowing from net exporters to net importers
    const exporters = nodes.filter((n) => n.net_export_kw > 0.2);
    const importers = nodes.filter((n) => n.net_export_kw < -0.2);

    if (exporters.length > 0 && importers.length > 0) {
      for (let i = 0; i < 20; i++) {
        const from = exporters[Math.floor(Math.random() * exporters.length)];
        const to = importers[Math.floor(Math.random() * importers.length)];
        particles.push({
          fromNodeId: from.id,
          toNodeId: to.id,
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.008,
          color: from.type === "storage" ? "#a855f7" : "#10b981", // purple for battery, emerald for solar
        });
      }
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Substation Central Bus bar in background
      ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
      ctx.lineWidth = 1;
      // Grid lines
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Interconnection Power Links between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Draw & Animate Energy Quantum Packets (Particles)
      particles.forEach((p) => {
        const from = nodes.find((n) => n.id === p.fromNodeId);
        const to = nodes.find((n) => n.id === p.toNodeId);
        if (!from || !to) return;

        p.progress += p.speed;
        if (p.progress >= 1.0) {
          p.progress = 0;
          // reroll target
          if (importers.length > 0) {
            p.toNodeId = importers[Math.floor(Math.random() * importers.length)].id;
          }
        }

        const curX = from.x + (to.x - from.x) * p.progress;
        const curY = from.y + (to.y - from.y) * p.progress;

        // Glowing packet
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedId === node.id;
        const isExporting = node.net_export_kw > 0.1;
        const isImporting = node.net_export_kw < -0.1;

        // Outer glow aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 34 : 26, 0, Math.PI * 2);
        const ringColor = isExporting
          ? "rgba(16, 185, 129, 0.3)"
          : isImporting
          ? "rgba(239, 68, 68, 0.3)"
          : "rgba(59, 130, 246, 0.3)";
        ctx.fillStyle = ringColor;
        ctx.fill();

        // Pulsing active halo
        if (isExporting) {
          ctx.beginPath();
          const pulseSize = 26 + (Math.sin(frame * 0.08) + 1) * 4;
          ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Inner solid circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? "#1e293b"
          : isExporting
          ? "#064e3b"
          : isImporting
          ? "#7f1d1d"
          : "#1e293b";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#38bdf8" : "#94a3b8";
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Node glyph text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let icon = "⚡";
        if (node.type === "storage") icon = "🔋";
        else if (node.type === "flexible_load") icon = "🚗";
        else if (node.solar_kw > 0) icon = "☀️";
        ctx.fillText(icon, node.x, node.y);

        // Name & Net Balance Label
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(node.name, node.x, node.y + 36);

        ctx.font = "10px sans-serif";
        const netStr =
          node.net_export_kw >= 0
            ? `+${node.net_export_kw.toFixed(1)} kW (Sell)`
            : `${node.net_export_kw.toFixed(1)} kW (Buy)`;
        ctx.fillStyle = node.net_export_kw >= 0 ? "#34d399" : "#f87171";
        ctx.fillText(netStr, node.x, node.y + 50);

        if (node.battery_soc_pct > 0) {
          ctx.fillStyle = "#cbd5e1";
          ctx.fillText(`SoC: ${node.battery_soc_pct}%`, node.x, node.y + 62);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, selectedId]);

  // Handle click on canvas to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const clickedNode = nodes.find((n) => {
      const dist = Math.hypot(n.x - clickX, n.y - clickY);
      return dist <= 30;
    });

    if (clickedNode) {
      setSelectedId(clickedNode.id);
      if (onSelectNode) onSelectNode(clickedNode);
    } else {
      setSelectedId(null);
      if (onSelectNode) onSelectNode(null);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 p-2 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Power Topology
          </span>
          <span className="text-slate-400">• Satellite 11kV Feeder Line</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Solar Surplus
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Battery Discharge
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Load Demand
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-[460px] cursor-pointer block"
        style={{ aspectRatio: "800 / 500" }}
      />

      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 pointer-events-none">
        💡 Click any node on the topology to inspect smart meter telemetry & open orders
      </div>
    </div>
  );
}
