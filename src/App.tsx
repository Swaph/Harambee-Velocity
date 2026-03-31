/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  UploadCloud,
  Network,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---

const MOCK_RAW_DATA = `MPESA: Confirmed. Ksh5,000.00 sent to Aga Khan Hospital for medical bill on 12/10/25 at 10:45 AM.
MPESA: Confirmed. Ksh2,500.00 sent to Mama Njeri (Family Support) on 14/10/25 at 08:30 AM.
MPESA: Confirmed. Ksh10,000.00 sent to Umoja Chama Pool on 15/10/25 at 12:00 PM.
MPESA: Confirmed. Ksh1,500.00 sent to SportPesa on 16/10/25 at 09:15 PM.
MPESA: Confirmed. Ksh3,000.00 paid to KPLC Prepaid on 18/10/25 at 07:00 AM.
MPESA: Confirmed. Ksh8,000.00 received from John Doe on 20/10/25 at 02:45 PM.
MPESA: Confirmed. Ksh4,500.00 sent to Nairobi Water Company on 22/10/25 at 11:20 AM.
MPESA: Confirmed. Ksh2,000.00 sent to Betika on 25/10/25 at 10:30 PM.`;

type Classification = 'Social_Investment' | 'Sunk_Cost' | 'Standard_Utility' | 'Inflow' | 'Other_Outflow';

interface Transaction {
  id: string;
  date: string;
  entity: string;
  amount: number;
  classification: Classification;
}

const PARSED_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '12/10/25 10:45 AM', entity: 'Aga Khan Hospital', amount: 5000, classification: 'Social_Investment' },
  { id: '2', date: '14/10/25 08:30 AM', entity: 'Mama Njeri', amount: 2500, classification: 'Social_Investment' },
  { id: '3', date: '15/10/25 12:00 PM', entity: 'Umoja Chama Pool', amount: 10000, classification: 'Social_Investment' },
  { id: '4', date: '16/10/25 09:15 PM', entity: 'SportPesa', amount: 1500, classification: 'Sunk_Cost' },
  { id: '5', date: '18/10/25 07:00 AM', entity: 'KPLC Prepaid', amount: 3000, classification: 'Standard_Utility' },
  { id: '6', date: '20/10/25 02:45 PM', entity: 'John Doe', amount: 8000, classification: 'Inflow' },
  { id: '7', date: '22/10/25 11:20 AM', entity: 'Nairobi Water Company', amount: 4500, classification: 'Standard_Utility' },
  { id: '8', date: '25/10/25 10:30 PM', entity: 'Betika', amount: 2000, classification: 'Sunk_Cost' },
];

const NETWORK_DATA = [
  { x: 50, y: 50, z: 100, name: 'User (You)', type: 'user' },
  { x: 20, y: 80, z: 60, name: 'Aga Khan Hospital', type: 'vouched' },
  { x: 80, y: 70, z: 80, name: 'Umoja Chama Pool', type: 'vouched' },
  { x: 30, y: 20, z: 50, name: 'Mama Njeri', type: 'vouched' },
  { x: 70, y: 30, z: 40, name: 'KPLC Prepaid', type: 'utility' },
  { x: 90, y: 10, z: 30, name: 'SportPesa', type: 'sunk' },
];

// --- Components ---

const Badge = ({ classification }: { classification: Classification }) => {
  const styles = {
    Social_Investment: 'bg-safaricom-green/20 text-safaricom-green border-safaricom-green/30',
    Sunk_Cost: 'bg-terracotta/20 text-terracotta border-terracotta/30',
    Standard_Utility: 'bg-electric-blue/20 text-electric-blue border-electric-blue/30',
    Inflow: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    Other_Outflow: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const labels = {
    Social_Investment: 'Social Investment',
    Sunk_Cost: 'Sunk Cost',
    Standard_Utility: 'Standard Utility',
    Inflow: 'Inflow',
    Other_Outflow: 'Other Outflow',
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit", styles[classification])}>
      {classification === 'Social_Investment' && <ShieldCheck className="w-3 h-3" />}
      {classification === 'Sunk_Cost' && <AlertTriangle className="w-3 h-3" />}
      {classification === 'Standard_Utility' && <Activity className="w-3 h-3" />}
      {classification === 'Inflow' && <TrendingUp className="w-3 h-3" />}
      {labels[classification]}
    </span>
  );
};

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [rawData, setRawData] = useState(MOCK_RAW_DATA);

  const handleAnalyze = () => {
    if (!rawData.trim()) return;
    setIsAnalyzing(true);
    // Simulate network delay for analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 2500);
  };

  // Calculate metrics based on parsed data
  const totalSocialInvestment = PARSED_TRANSACTIONS.filter(t => t.classification === 'Social_Investment').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSunkCost = PARSED_TRANSACTIONS.filter(t => t.classification === 'Sunk_Cost').reduce((acc, curr) => acc + curr.amount, 0);
  const totalLiquidityFlow = PARSED_TRANSACTIONS.filter(t => t.classification !== 'Inflow').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Harambee Velocity Score (Mock calculation: Social Investment / (Social Investment + Sunk Cost))
  const velocityScore = Math.round((totalSocialInvestment / (totalSocialInvestment + totalSunkCost)) * 100);

  const pieData = [
    { name: 'Velocity', value: velocityScore, color: '#4ade80' },
    { name: 'Gap', value: 100 - velocityScore, color: '#2a2e39' }
  ];

  return (
    <div className="min-h-screen bg-dark-charcoal text-gray-100 p-4 md:p-8 font-sans selection:bg-safaricom-green/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-safaricom-green/10 border border-safaricom-green/30 flex items-center justify-center glow-green">
              <Network className="w-6 h-6 text-safaricom-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Horizon A</h1>
              <p className="text-xs font-mono text-safaricom-green tracking-widest uppercase opacity-80">Social Equity Engine</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-mono text-gray-400 bg-dark-surface px-4 py-2 rounded-full border border-dark-border">
            <span className="w-2 h-2 rounded-full bg-safaricom-green animate-pulse"></span>
            System Online
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Ingestion Zone */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-electric-blue" />
                <h2 className="text-lg font-semibold text-white">Ingest Alternative Data</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Paste raw SMS or M-Pesa transaction logs to evaluate Harambee Velocity.
              </p>
              
              <div className="relative flex-grow flex flex-col">
                <textarea 
                  className="w-full flex-grow min-h-[300px] bg-dark-charcoal/50 border border-dark-border rounded-lg p-4 font-mono text-xs text-gray-300 focus:outline-none focus:border-safaricom-green/50 focus:ring-1 focus:ring-safaricom-green/50 transition-all resize-none"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="Paste M-Pesa SMS here..."
                  spellCheck={false}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => setRawData(MOCK_RAW_DATA)}
                    className="p-1.5 bg-dark-surface rounded hover:bg-dark-border transition-colors text-gray-400 hover:text-white"
                    title="Load Sample Data"
                  >
                    <UploadCloud className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !rawData.trim()}
                className={cn(
                  "mt-6 w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                  isAnalyzing 
                    ? "bg-dark-border text-gray-400 cursor-not-allowed" 
                    : "bg-safaricom-green text-dark-charcoal hover:bg-safaricom-green/90 glow-green"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Parsing Data Streams...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Analyze Harambee Velocity
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Insights & Trust Graph */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Insights Stage */}
            <div className="glass-panel p-6 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-safaricom-green/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-safaricom-green" />
                <h2 className="text-lg font-semibold text-white">Insights Stage</h2>
              </div>

              {!hasAnalyzed && !isAnalyzing ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-500 border border-dashed border-dark-border rounded-lg">
                  <Network className="w-12 h-12 mb-4 opacity-20" />
                  <p>Awaiting data ingestion to generate insights.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[300px] flex flex-col items-center justify-center"
                    >
                      <div className="w-16 h-16 border-4 border-dark-border border-t-safaricom-green rounded-full animate-spin mb-4"></div>
                      <p className="text-safaricom-green font-mono text-sm animate-pulse">Calculating Social Collateral...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {/* Harambee Velocity Dial */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center bg-dark-charcoal/30 rounded-xl p-4 border border-dark-border/50">
                        <div className="relative w-48 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white tracking-tighter">{velocityScore}%</span>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <h3 className="text-sm font-semibold text-gray-200">Harambee Velocity Score</h3>
                          <p className="text-xs text-safaricom-green mt-1 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> High Community Collateral
                          </p>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-dark-charcoal/30 rounded-xl p-5 border border-dark-border/50 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-safaricom-green mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Total Social Investment</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono">
                            <span className="text-gray-500 text-xl mr-1">KSH</span>
                            {totalSocialInvestment.toLocaleString()}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">Funds directed to community & safety nets</div>
                        </div>

                        <div className="bg-dark-charcoal/30 rounded-xl p-5 border border-dark-border/50 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-terracotta mb-2">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Sunk Cost Leakage</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono">
                            <span className="text-gray-500 text-xl mr-1">KSH</span>
                            {totalSunkCost.toLocaleString()}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">Funds directed to high-risk/luxury</div>
                        </div>

                        <div className="sm:col-span-2 bg-dark-charcoal/30 rounded-xl p-5 border border-dark-border/50 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-electric-blue mb-2">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Total Liquidity Flow</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-mono">
                            <span className="text-gray-500 text-xl mr-1">KSH</span>
                            {totalLiquidityFlow.toLocaleString()}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">Total outbound transaction volume analyzed</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Trust Graph */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-6">
                <Network className="w-5 h-5 text-electric-blue" />
                <h2 className="text-lg font-semibold text-white">Trust Graph (Social Nodes)</h2>
              </div>
              
              {!hasAnalyzed && !isAnalyzing ? (
                <div className="h-[250px] flex items-center justify-center text-gray-500 border border-dashed border-dark-border rounded-lg">
                  <p>Awaiting analysis...</p>
                </div>
              ) : isAnalyzing ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-[250px] w-full bg-dark-charcoal/30 rounded-xl border border-dark-border/50 relative"
                >
                  {/* Custom SVG Network Graph for better visual control than Recharts Scatter */}
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    {/* Edges */}
                    {NETWORK_DATA.filter(n => n.type !== 'user').map((node, i) => (
                      <motion.line 
                        key={`edge-${i}`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        x1="50" y1="50" x2={node.x} y2={node.y} 
                        stroke={node.type === 'vouched' ? '#4ade80' : node.type === 'sunk' ? '#e2725b' : '#0ea5e9'} 
                        strokeWidth="0.5"
                        strokeDasharray={node.type === 'vouched' ? "none" : "2,2"}
                      />
                    ))}
                    
                    {/* Nodes */}
                    {NETWORK_DATA.map((node, i) => {
                      const isUser = node.type === 'user';
                      const color = isUser ? '#ffffff' : node.type === 'vouched' ? '#4ade80' : node.type === 'sunk' ? '#e2725b' : '#0ea5e9';
                      const radius = isUser ? 4 : node.z / 20;
                      
                      return (
                        <g key={`node-${i}`}>
                          {/* Glow effect */}
                          <circle cx={node.x} cy={node.y} r={radius * 2} fill={color} opacity="0.1" />
                          <motion.circle 
                            initial={{ r: 0 }}
                            animate={{ r: radius }}
                            transition={{ type: 'spring', delay: 0.3 + (i * 0.1) }}
                            cx={node.x} cy={node.y} fill={color} 
                          />
                          <text 
                            x={node.x} 
                            y={node.y + radius + 3} 
                            fontSize="3" 
                            fill={isUser ? '#ffffff' : '#9ca3af'} 
                            textAnchor="middle"
                            className="font-mono"
                          >
                            {node.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Section: Extracted Ledger */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Extracted Ledger</h2>
            </div>
            {hasAnalyzed && (
              <span className="text-xs font-mono text-safaricom-green bg-safaricom-green/10 px-3 py-1 rounded-full border border-safaricom-green/20">
                {PARSED_TRANSACTIONS.length} Records Parsed
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-xs font-mono text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pl-4 font-medium">Date</th>
                  <th className="pb-3 font-medium">Entity</th>
                  <th className="pb-3 font-medium text-right pr-8">Amount (KSH)</th>
                  <th className="pb-3 font-medium">Classification</th>
                </tr>
              </thead>
              <tbody>
                {!hasAnalyzed && !isAnalyzing ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 text-sm border-b border-dark-border/50">
                      No data extracted yet.
                    </td>
                  </tr>
                ) : isAnalyzing ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 text-sm border-b border-dark-border/50">
                      <div className="flex justify-center items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-safaricom-green" />
                        Processing transactions...
                      </div>
                    </td>
                  </tr>
                ) : (
                  PARSED_TRANSACTIONS.map((tx, idx) => (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors group"
                    >
                      <td className="py-4 pl-4 text-sm text-gray-300 font-mono whitespace-nowrap">{tx.date}</td>
                      <td className="py-4 text-sm text-gray-100 font-medium">{tx.entity}</td>
                      <td className="py-4 text-sm text-gray-200 font-mono text-right pr-8 group-hover:text-white transition-colors">
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4">
                        <Badge classification={tx.classification} />
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
