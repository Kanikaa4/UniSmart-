import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowUpRight, ShieldCheck, Calendar, BrainCircuit, FileSpreadsheet } from 'lucide-react';

export default function LandingPage({ onLaunchPortal }) {
  // Counters state
  const [authTime, setAuthTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [exportTime, setExportTime] = useState(0);

  useEffect(() => {
    // Animate metrics counters on load
    const interval = setInterval(() => {
      setAuthTime(prev => (prev < 2 ? prev + 1 : 2));
      setAccuracy(prev => (prev < 87 ? prev + 3 : 87));
      setExportTime(prev => (prev < 10 ? prev + 1 : 10));
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bgbase text-textPrimary selection:bg-primaryIndigo">
      {/* Header */}
      <header className="header flex justify-between items-center px-[4%] h-[80px] bg-[#0a0b10cc] backdrop-blur-md border-b border-glassBorder sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-[42px] height-[42px] bg-gradient-to-br from-primaryIndigo to-secondaryTeal rounded-lg text-white p-2">
            <GraduationCap size={24} />
          </div>
          <span className="text-[1.5rem] font-extrabold tracking-tight">
            Uni<span className="gradient-text">Smart</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-[30px]">
          <a href="#features" className="text-textSecondary hover:text-primaryIndigo font-medium transition-colors">Features</a>
          <a href="#metrics" className="text-textSecondary hover:text-primaryIndigo font-medium transition-colors">Success Metrics</a>
          <a href="#future" className="text-textSecondary hover:text-primaryIndigo font-medium transition-colors">Future Scope</a>
        </nav>
        <button 
          onClick={onLaunchPortal}
          className="bg-gradient-to-r from-primaryIndigo to-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow"
        >
          <span>Launch Portal</span>
          <ArrowUpRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <main className="marketing-view">
        <section className="relative flex flex-col items-center justify-center text-center min-h-[80vh] px-[4%] py-[60px] overflow-hidden">
          {/* Blurred Background Shapes */}
          <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-primaryIndigo opacity-30 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[5%] right-[15%] w-[450px] h-[450px] bg-accentPurple opacity-25 rounded-full filter blur-[120px] animate-pulse"></div>

          <div className="relative z-10 max-w-4xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-glassBorder px-4 py-1.5 rounded-full text-xs font-semibold text-textSecondary mb-6">
              <span className="w-2 h-2 bg-secondaryTeal rounded-full shadow-[0_0_8px_#14b8a6]"></span>
              <span>Full-Stack AI-Powered LMS Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              The Future of University <br />
              <span className="gradient-text">Learning & Attendance</span>
            </h1>
            <p className="text-lg md:text-xl text-textSecondary max-w-2xl mb-10">
              Streamline class attendance, predict chronic absenteeism, and automate administrative tasks using our React, Express, and MongoDB platform.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onLaunchPortal}
                className="bg-gradient-to-r from-primaryIndigo to-indigo-600 text-white font-bold px-8 py-3.5 rounded-lg shadow-glow hover:scale-[1.02] transition-transform"
              >
                Get Started
              </button>
              <a 
                href="#features" 
                className="bg-white/5 hover:bg-white/10 border border-glassBorder text-textPrimary font-bold px-8 py-3.5 rounded-lg transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-[8%] py-[100px] border-t border-glassBorder">
          <div className="text-center mb-[60px]">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Core Platform Modules</h2>
            <p className="text-textSecondary max-w-xl mx-auto">A state-of-the-art suite designed for university registrars and department faculty.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 hover:border-glassBorderFocus hover:bg-white/[0.03] transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure OTP Login</h3>
              <p className="text-textSecondary text-sm">Secure passwordless entry via email OTP dispatched with Nodemailer.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 hover:border-glassBorderFocus hover:bg-white/[0.03] transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl mb-5">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Attendance Calendar</h3>
              <p className="text-textSecondary text-sm">Intuitive monthly grid layout allowing faculty to easily mark and save logs.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 hover:border-glassBorderFocus hover:bg-white/[0.03] transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl mb-5">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart AI Insights</h3>
              <p className="text-textSecondary text-sm">Absenteeism neural network prediction modeling to warn of dropout risks early.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 hover:border-glassBorderFocus hover:bg-white/[0.03] transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl mb-5">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Excel Sync Engine</h3>
              <p className="text-textSecondary text-sm">Bulk import student roster sheets and export detailed attendance spreadsheets.</p>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section id="metrics" className="px-[8%] py-[100px] border-t border-glassBorder bg-gradient-to-b from-transparent to-white/[0.01]">
          <div className="text-center mb-[60px]">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Designed for High Performance</h2>
            <p className="text-textSecondary max-w-xl mx-auto">Real-world indicators backing our technical design and database configurations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 rounded-2xl text-center">
              <div className="text-[3.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-textSecondary mb-2">
                &lt; {authTime}s
              </div>
              <div className="text-textSecondary font-semibold text-xs tracking-wider uppercase">OTP Authentication Login Time</div>
            </div>

            <div className="glass-panel p-10 rounded-2xl text-center">
              <div className="text-[3.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-textSecondary mb-2">
                &gt; {accuracy}%
              </div>
              <div className="text-textSecondary font-semibold text-xs tracking-wider uppercase">AI Prediction Roster Accuracy</div>
            </div>

            <div className="glass-panel p-10 rounded-2xl text-center">
              <div className="text-[3.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-textSecondary mb-2">
                &lt; {exportTime}s
              </div>
              <div className="text-textSecondary font-semibold text-xs tracking-wider uppercase">Roster Excel Report Export Time</div>
            </div>
          </div>
        </section>

        {/* Future Scope Section */}
        <section id="future" className="px-[8%] py-[100px] border-t border-glassBorder">
          <div className="text-center mb-[60px]">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Future Roadmap</h2>
            <p className="text-textSecondary max-w-xl mx-auto">Expansion features scheduled for upcoming releases.</p>
          </div>
          <div className="max-w-3xl mx-auto relative pl-10 border-l border-glassBorder flex flex-col gap-12">
            <div className="relative">
              <div className="absolute -left-[51px] top-1.5 w-6 h-6 rounded-full bg-secondaryTeal flex items-center justify-center text-xs font-bold text-bgbase">
                1
              </div>
              <span className="text-secondaryTeal text-sm font-bold">Q3 2026</span>
              <h3 className="text-lg font-bold mt-1">Student & Parent Portals</h3>
              <p className="text-textSecondary text-sm mt-1">Direct view panels for parent accountability checks and student grades auditing.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[51px] top-1.5 w-6 h-6 rounded-full bg-glassBorder border border-glassBorderFocus flex items-center justify-center text-xs font-bold text-textSecondary">
                2
              </div>
              <span className="text-textMuted text-sm font-bold">Q4 2026</span>
              <h3 className="text-lg font-bold mt-1">Mobile Native Application</h3>
              <p className="text-textSecondary text-sm mt-1">Android and iOS React Native build integrations to push alerts and attendance triggers.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[51px] top-1.5 w-6 h-6 rounded-full bg-glassBorder border border-glassBorderFocus flex items-center justify-center text-xs font-bold text-textSecondary">
                3
              </div>
              <span className="text-textMuted text-sm font-bold">Q1 2027</span>
              <h3 className="text-lg font-bold mt-1">24/7 AI Academic Assistant</h3>
              <p className="text-textSecondary text-sm mt-1">LLM-based chatbot answering questions about syllabus tracking, grades, and scheduling classes.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
