import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { MachineCondition, FaultSeverity } from '../types';
import { BrainCircuit, ShieldCheck, AlertTriangle, Cpu, CheckCircle2, Sparkles, Clock, Compass } from 'lucide-react';

export const AiPredictionView: React.FC = () => {
  const { latestPrediction, aiHistory, activeDevice } = useApp();

  const pred = latestPrediction || {
    prediction: 'Healthy' as MachineCondition,
    confidence: 96.4,
    healthy_probability: 96.4,
    warning_probability: 2.8,
    fault_probability: 0.8,
    fault_type: 'None',
    severity: 'Low' as FaultSeverity,
    recommendation: 'No immediate maintenance required. Continue monitoring vibration trend.',
    timestamp: new Date().toISOString(),
  };

  const getSeverityStyle = (sev: FaultSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const classifications: { type: MachineCondition; desc: string }[] = [
    { type: 'Healthy', desc: 'Symmetrical 1x vibration spectrum, minimal RMS noise' },
    { type: 'Unbalance', desc: 'Dominant 1x rotational harmonic spike on X/Y axis' },
    { type: 'Loose Mounting', desc: 'Harmonic 2x, 3x chatter & vertical Z-axis spike' },
    { type: 'Bearing Wear', desc: 'High frequency impact transients & thermal rise' },
    { type: 'Critical Fault', desc: 'Combined multi-fault degradation & severe overheating' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-3">
          <BrainCircuit className="w-7 h-7 text-purple-400" />
          <span>AI Machine Condition Prediction</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Embedded TinyML Neural Inference (Quantized Int8 Model on ESP32 / Cloud Engine)
        </p>
      </div>

      {/* Main AI Prediction Large Card */}
      <div className="bg-gradient-to-br from-surface-100 via-surface-200 to-surface-300 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Left: Prediction Status & Confidence */}
          <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-surface-border pb-6 lg:pb-0 lg:pr-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>CURRENT TINYML CLASSIFICATION</span>
            </div>

            <div>
              <div className="text-3xl font-extrabold font-mono text-slate-100 uppercase tracking-tight flex items-center space-x-3">
                <span>{pred.prediction}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">Device Node: {activeDevice.device_id}</p>
            </div>

            {/* Confidence Metric */}
            <div className="p-4 rounded-xl bg-surface-300 border border-surface-border font-mono space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">MODEL CONFIDENCE</span>
                <span className="font-bold text-emerald-400 text-sm">{pred.confidence.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pred.confidence}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Fault Severity:</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getSeverityStyle(pred.severity)}`}>
                {pred.severity}
              </span>
            </div>
          </div>

          {/* Middle: Probability Bars */}
          <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-surface-border pb-6 lg:pb-0 lg:pr-6 font-mono text-xs">
            <div className="text-xs text-slate-400 font-semibold uppercase">Class Probabilities</div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Healthy Probability</span>
                  <span className="font-bold text-emerald-400">{pred.healthy_probability.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${pred.healthy_probability}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Warning Probability</span>
                  <span className="font-bold text-amber-400">{pred.warning_probability.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${pred.warning_probability}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Fault Probability</span>
                  <span className="font-bold text-rose-400">{pred.fault_probability.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full" style={{ width: `${pred.fault_probability}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-300 border border-surface-border">
              <span className="text-[11px] text-slate-400 font-semibold">Identified Fault Type:</span>
              <div className="text-sm font-bold text-purple-300 mt-0.5">{pred.fault_type}</div>
            </div>
          </div>

          {/* Right: AI Maintenance Recommendation */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
                <Compass className="w-4 h-4" />
                <span>AI PREDICTIVE RECOMMENDATION</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-300 border border-surface-border text-xs leading-relaxed text-slate-200 font-sans">
                "{pred.recommendation}"
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300 space-y-1">
              <div className="font-bold">TinyML Spec:</div>
              <div>Model: MobileNet-Vibration 1D-CNN (Int8)</div>
              <div>Memory: 34.2 KB SRAM / 128 KB Flash</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fault Classification Diagnostic Reference Grid */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Supported TinyML Fault Classifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          {classifications.map((item) => (
            <div
              key={item.type}
              className={`p-3 rounded-xl border transition-all ${
                pred.prediction === item.type
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-glow-purple'
                  : 'bg-surface-200 border-surface-border text-slate-400'
              }`}
            >
              <div className="font-bold text-sm text-slate-100 mb-1 flex items-center justify-between">
                <span>{item.type}</span>
                {pred.prediction === item.type && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] leading-tight font-sans text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Predictions Timeline Table */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Historical TinyML Prediction Log</span>
          </h3>
          <span className="text-slate-400 text-[11px]">{aiHistory.length} total inferences logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Prediction</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Fault Signature</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300 text-[11px]">
              {aiHistory.slice(0, 10).map((h) => (
                <tr key={h.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 px-3">{new Date(h.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-100">{h.prediction}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{h.confidence}%</td>
                  <td className="py-2.5 px-3 text-purple-300">{h.fault_type}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={h.severity} />
                  </td>
                  <td className="py-2.5 px-3 truncate max-w-xs text-slate-400">{h.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
