import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Boxes,
  Truck,
  Building2,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface Concept {
  id: string;
  title: string;
  question: string;
  formula?: string;
  explanation: string;
  example: string;
  icon: React.ElementType;
}

const CONCEPTS: Concept[] = [
  {
    id: 'inventory',
    title: 'What is Inventory?',
    question: 'How do we define inventory in an engineering supply chain?',
    formula: 'Total Inventory = Raw Materials + WIP + Finished Goods + MRO Supplies',
    explanation:
      'Inventory refers to all tangible goods, components, and raw materials held by an enterprise at any echelon of the supply chain. In technical systems, inventory acts as a physical buffer decoupling the continuous variations in customer demand from discrete production batches and vendor delivery latencies.',
    example:
      'Example: Holding 140 Industrial Bearings and 320 Steel Rods ensures that robotic manufacturing lines never stall if a shipment arrives late.',
    icon: Boxes
  },
  {
    id: 'inventory-chaining',
    title: 'What is Inventory Chaining?',
    question: 'What is multi-echelon inventory chaining?',
    formula: 'Supplier → Manufacturer → Distributor → Retailer → Customer',
    explanation:
      'Inventory Chaining is the sequential interconnection of stocking points (echelons) where the output of one echelon becomes the inventory input of the next. Each stage depends on inventory signals, order batching, and physical transportation pipelines from the preceding stage.',
    example:
      'Example: When a Customer buys a pump from a Retailer, the Retailer pulls from the Distributor, who pulls from the Manufacturer, who in turn procures casting ingots from the Supplier.',
    icon: Layers
  },
  {
    id: 'reorder-point',
    title: 'What is a Reorder Point (ROP)?',
    question: 'When should a restock order be generated?',
    formula: 'ROP = (Average Daily Demand × Lead Time) + Safety Stock',
    explanation:
      'The Reorder Point is a predetermined minimum inventory threshold. When on-hand inventory drops to or below the ROP, a purchase order must be issued immediately. This ensures that new replenishment batches arrive exactly as current stock approaches the safety buffer.',
    example:
      'Example: If daily demand is 16 units, lead time is 5 days, and safety buffer is 40 units: ROP = (16 × 5) + 40 = 120 units.',
    icon: Sparkles
  },
  {
    id: 'safety-stock',
    title: 'What is Safety Stock (SS)?',
    question: 'Why do we need an extra cushion of inventory?',
    formula: 'Safety Stock = Z × σ_d × √LeadTime',
    explanation:
      'Safety Stock is a surplus reserve held to mitigate the dual uncertainties of demand spikes (customers ordering more than forecast) and supply delays (carrier or supplier delivery bottlenecks). It protects against stockout penalties.',
    example:
      'Example: Maintaining 30 extra motors buffers the factory if a storm delays highway transit freight by 48 hours.',
    icon: ShieldCheck
  },
  {
    id: 'lead-time',
    title: 'What is Lead Time (LT)?',
    question: 'How does latency affect the supply pipeline?',
    formula: 'Lead Time = Order Processing + Manufacturing + Freight Transit + Receiving Inspection',
    explanation:
      'Lead Time is the total elapsed time between when an order is initiated and when the goods arrive, are inspected, and become available for immediate dispatch or production. Longer lead times require higher safety stocks and generate larger pipeline inventory.',
    example:
      'Example: A specialized PLC panel has a 12-day lead time due to component procurement, assembly burn-in testing, and regional freight.',
    icon: Clock
  },
  {
    id: 'holding-cost',
    title: 'What is Holding Cost (Carrying Cost)?',
    question: 'Why is excessive inventory an operational liability?',
    formula: 'Holding Cost = Average Inventory × Unit Cost × Annual Carrying Rate %',
    explanation:
      'Holding cost represents the total financial expense incurred to hold inventory over time. It includes capital opportunity cost (tied-up cash), warehouse rent, heating/cooling, insurance, security, deterioration, and product obsolescence.',
    example:
      'Example: Holding $100,000 worth of parts at an 18% annual holding rate costs the lab $18,000 per year ($49.31 every single day).',
    icon: Layers
  },
  {
    id: 'stockout',
    title: 'What is a Stockout?',
    question: 'What occurs when inventory reaches zero?',
    formula: 'Stockout Event = Current Inventory <= 0 while Unmet Demand > 0',
    explanation:
      'A stockout occurs when inventory is completely depleted and incoming customer orders cannot be fulfilled immediately. Stockouts cause lost sales revenues, rush expediting penalties, customer dissatisfaction, and potential breach of SLA contracts.',
    example:
      'Example: The Retailer ran out of Gear Assemblies, resulting in 8 backorders and stalled industrial customer repair operations.',
    icon: XCircle
  },
  {
    id: 'turnover',
    title: 'What is Inventory Turnover?',
    question: 'How do we measure inventory capital velocity?',
    formula: 'Inventory Turnover = Cost of Goods Sold (COGS) / Average Inventory Value',
    explanation:
      'Inventory turnover measures how many times per year an organization sells and replenishes its entire inventory stock. A higher turnover ratio indicates superior sales velocity, efficient working capital utilization, and minimal cash tied up in idle storage.',
    example:
      'Example: A company with $500,000 annual COGS and an average inventory of $100,000 turns its inventory 5.0 times annually.',
    icon: Zap
  }
];

const TUTORIAL_STEPS = [
  {
    step: 1,
    stage: '1. Supplier Tier',
    title: 'Raw Material Procurement',
    summary:
      'Suppliers extract ore and manufacture raw billets, rods, and basic castings. They operate on long batch cycles with minimum order quantities (MOQs).',
    keyTakeaway: 'Lead times are longest here; bulk purchasing discounts often dictate order sizes.'
  },
  {
    step: 2,
    stage: '2. Manufacturer Tier',
    title: 'Precision Assembly & Work-in-Progress (WIP)',
    summary:
      'Manufacturers convert raw material inputs into complex assemblies, motors, and hydraulic pumps. Production planning balances machine setup costs against holding costs.',
    keyTakeaway: 'Capacity bottlenecks determine line throughput; assembly lead times dictate factory inventory.'
  },
  {
    step: 3,
    stage: '3. Distributor Tier',
    title: 'Logistics Hub & Freight Consolidation',
    summary:
      'Distributors decouple large manufacturing batch runs from fragmented retail store demand by keeping regional buffer stocks ready for 24-48 hour dispatch.',
    keyTakeaway: 'The distributor acts as the central shock absorber between supply production and retail consumption.'
  },
  {
    step: 4,
    stage: '4. Retailer Tier',
    title: 'Customer Trade Counter & Reorder Point',
    summary:
      'Retailers serve local engineering buyers directly. When store inventory reaches the calculated Reorder Point (ROP), a purchase order is dispatched to the Distributor.',
    keyTakeaway: 'Stockouts here directly cause lost revenue and frustrated clients.'
  },
  {
    step: 5,
    stage: '5. Customer Tier',
    title: 'Market Pull & The Bullwhip Phenomenon',
    summary:
      'Customer purchases provide the initial pull signal. However, if customer demand increases by just 10%, slight safety padding at each upstream stage can cause a 40%+ surge in orders at the supplier.',
    keyTakeaway: 'Information sharing across all 5 echelons reduces order signal distortion (The Bullwhip Effect).'
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'If Daily Demand is 20 units, Lead Time is 4 days, and Safety Stock is 30 units, what is the Reorder Point?',
    options: ['80 units', '110 units', '50 units', '140 units'],
    correctIndex: 1,
    explanation: 'ROP = (Demand × Lead Time) + Safety Stock = (20 × 4) + 30 = 80 + 30 = 110 units.'
  },
  {
    question: 'What is the primary danger of keeping an excessively large inventory buffer?',
    options: [
      'Frequent stockouts',
      'High holding costs and capital obsolescence',
      'Zero lead time',
      'Customer dissatisfaction'
    ],
    correctIndex: 1,
    explanation: 'Holding costs (storage rent, tied-up working capital, insurance, spoilage) climb linearly with excess inventory.'
  },
  {
    question: 'What is the "Bullwhip Effect" in inventory chaining?',
    options: [
      'A technique to speed up delivery trucks',
      'The distortion and amplification of demand variability moving upstream from customer to supplier',
      'A discount formula for bulk steel rods',
      'A method to eliminate safety stock'
    ],
    correctIndex: 1,
    explanation: 'Small fluctuations in end-customer demand create magnified, lumpy order volatility upstream through retailer, distributor, manufacturer, and supplier.'
  },
  {
    question: 'How is Customer Service Level calculated?',
    options: [
      '(Successfully Fulfilled Orders / Total Orders) × 100',
      'Holding Cost / Average Inventory',
      'Total Demand - Stockouts',
      'Daily Demand × Lead Time'
    ],
    correctIndex: 0,
    explanation: 'Customer Service Level (Fill Rate) measures the percentage of orders successfully satisfied directly from shelf inventory.'
  }
];

export const TrainingModeView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [activeSection, setActiveSection] = useState<'concepts' | 'tutorial' | 'quiz'>('concepts');
  const [selectedConcept, setSelectedConcept] = useState<Concept>(CONCEPTS[0]);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold mb-2 border border-blue-400/30">
              <GraduationCap className="w-4 h-4 text-blue-300" />
              <span>Academic Pedagogy & Engineering Curriculum</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Technical Training Lab — Learning Portal
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
              Master the core mathematical and operational principles of supply chain management:
              echelon chaining, lead times, safety stocks, reorder algorithms, and holding liabilities.
            </p>
          </div>

          {/* Navigation Pill Switches */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveSection('concepts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'concepts'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              8 Core Concepts
            </button>
            <button
              onClick={() => setActiveSection('tutorial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'tutorial'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Interactive Pipeline Walkthrough
            </button>
            <button
              onClick={() => setActiveSection('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'quiz'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Student Quiz
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: 8 CORE EDUCATIONAL CONCEPTS */}
      {activeSection === 'concepts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concept Navigation List */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 mb-2">
              Curriculum Modules
            </h3>
            {CONCEPTS.map(c => {
              const Icon = c.icon;
              const isSelected = selectedConcept.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConcept(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{c.title}</span>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Concept Explanation Detail Card */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                {React.createElement(selectedConcept.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">
                  Educational Concept Guide
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedConcept.title}</h3>
                <p className="text-xs text-slate-500">{selectedConcept.question}</p>
              </div>
            </div>

            {selectedConcept.formula && (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs sm:text-sm">
                <span className="text-[10px] text-blue-400 font-sans block mb-1 uppercase tracking-wider font-bold">
                  Mathematical Formulation
                </span>
                <span className="text-amber-300 font-bold">{selectedConcept.formula}</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Engineering Explanation
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed sm:text-sm">
                {selectedConcept.explanation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Practical Lab Application</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedConcept.example}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveSection('tutorial')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>See In Action in Pipeline Tutorial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GUIDED PIPELINE TUTORIAL */}
      {activeSection === 'tutorial' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">
                Guided Interactive Simulation Tutorial
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Multi-Echelon Step: {TUTORIAL_STEPS[tutorialStep].stage}
              </h3>
            </div>

            <div className="text-xs font-mono font-bold text-slate-500">
              Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
            </div>
          </div>

          {/* Visual Step Progress Bar */}
          <div className="grid grid-cols-5 gap-2">
            {TUTORIAL_STEPS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setTutorialStep(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  idx === tutorialStep
                    ? 'bg-blue-600'
                    : idx < tutorialStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
                title={s.stage}
              />
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              {TUTORIAL_STEPS[tutorialStep].title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {TUTORIAL_STEPS[tutorialStep].summary}
            </p>
            <div className="p-3.5 rounded-xl bg-white border border-blue-200 text-xs font-medium text-blue-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Key Takeaway:</strong> {TUTORIAL_STEPS[tutorialStep].keyTakeaway}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
              disabled={tutorialStep === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Echelon</span>
            </button>

            {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={() => setTutorialStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
              >
                <span>Next Echelon</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveSection('quiz')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                <span>Proceed to Student Quiz</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STUDENT KNOWLEDGE CHECK QUIZ */}
      {activeSection === 'quiz' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">
                Knowledge Check Assessment
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Supply Chain & Inventory Chaining Quiz
              </h3>
            </div>

            {quizSubmitted && (
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <span className="text-xs text-blue-800 font-semibold">Your Score:</span>
                <span className="text-base font-mono font-extrabold text-blue-900">
                  {calculateScore()} / {QUIZ_QUESTIONS.length} (
                  {Math.round((calculateScore() / QUIZ_QUESTIONS.length) * 100)}%)
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={qIdx}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optionClasses = 'bg-white border-slate-200 hover:border-blue-300 text-slate-700';

                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optionClasses = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionClasses = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                        } else {
                          optionClasses = 'bg-white border-slate-200 text-slate-400';
                        }
                      } else if (isOptionSelected) {
                        optionClasses = 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`p-3 rounded-lg border text-xs text-left transition-all cursor-pointer ${optionClasses}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`p-3 rounded-lg text-xs ml-9 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <span className="font-bold block mb-0.5">
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {quizSubmitted ? (
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Retake Quiz
              </button>
            ) : (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(userAnswers).length < QUIZ_QUESTIONS.length}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm disabled:opacity-40 transition-all cursor-pointer"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
