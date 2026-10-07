'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Menu,
  X,
  Zap,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Monitor,
  Database,
  ShieldCheck,
  Check,
  ExternalLink,
  Send,
  FileText,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function LinkedinIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Portfolio Content State with Resilient Defaults
  const [heroData, setHeroData] = useState({
    name: "ASHIFUR RAHMAN",
    title: "Electrical & Electronic Engineer",
    badge_text: "Available for Engineering, Technology & AI Opportunities",
    introduction: "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.",
    profile_image: "/ashifur.jpeg",
    primary_btn_text: "Contact Me",
    primary_btn_link: "mailto:ashifur.badhon@gmail.com",
    secondary_btn_text: "Download CV",
    secondary_btn_link: "/resume.pdf",
    spec_badge_label: "Specialization",
    spec_badge_title: "Engineering, Management & AI"
  });

  const [skillsData, setSkillsData] = useState([
    {
      category: 'Design & Simulation',
      icon: Monitor,
      items: [
        { name: 'AutoCAD (Electrical/2D)', level: 90 },
        { name: 'MATLAB / Simulink', level: 85 },
        { name: 'ETAP (Power System Analysis)', level: 80 },
        { name: 'PSNA / PVSyst', level: 75 },
      ]
    },
    {
      category: 'GIS & Data Systems',
      icon: Database,
      items: [
        { name: 'GIS (ArcGIS / QGIS)', level: 85 },
        { name: 'MS Excel (Advanced / Data)', level: 90 },
        { name: 'Spatial Network Mapping', level: 80 },
        { name: 'Technical Sales Analytics', level: 85 },
      ]
    },
    {
      category: 'Power Systems & Field',
      icon: ShieldCheck,
      items: [
        { name: 'Substation Operations & Testing', level: 88 },
        { name: 'Single Line Diagrams (SLD)', level: 92 },
        { name: 'Switchgear & Relay Coordination', level: 82 },
        { name: 'Distribution Network & BOQ', level: 86 },
      ]
    }
  ]);

  const [projectsData, setProjectsData] = useState([
    {
      id: '01',
      title: '132/33kV Grid Substation SLD & Protection Design',
      description: 'Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.',
      tags: ['AutoCAD', 'ETAP', 'Power Systems']
    },
    {
      id: '02',
      title: 'GIS-Based Power Distribution Asset Mapping',
      description: 'Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.',
      tags: ['ArcGIS', 'QGIS', 'Spatial Analysis']
    },
    {
      id: '03',
      title: 'Automatic Power Factor Correction (APFC) Simulation',
      description: 'Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.',
      tags: ['MATLAB', 'Simulink', 'Industrial Control']
    },
    {
      id: '04',
      title: '50kW Rooftop Solar PV Feasibility & Sizing',
      description: 'Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.',
      tags: ['PVSyst', 'Solar PV', 'AutoCAD']
    },
    {
      id: '05',
      title: 'Industrial Motor Control & Protective Schematics',
      description: 'Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.',
      tags: ['PSNA', 'Motor Control', 'AutoCAD']
    },
    {
      id: '06',
      title: 'Automated Sales & Quotation Management Engine',
      description: 'Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.',
      tags: ['MS Excel', 'Data Analytics', 'BOQ']
    }
  ]);

  const [experiences, setExperiences] = useState([
    {
      role: 'Executive Officer',
      organization: 'Ventech Digital — Sales & Management | Remote',
      period: 'January 2023 – January 2025',
      points: [
        'Categorized and pre-processed large datasets for operational use.',
        'Prepared production capacity forecasts to support marketing activities.',
        'Developed work plans based on manpower and time requirements.',
        'Managed workflow from order processing through sales completion.',
        'Coordinated with management and teams to maintain efficient supply chain operations.',
        'Prepared management reports on targets, achievements, and operational performance.'
      ]
    },
    {
      role: 'Internee Engineer',
      organization: 'Dhaka Electric Supply Company Ltd. (DESCO) — Systemic & Commercial Operation Department | Uttara (West), Dhaka',
      period: 'February 2023 – March 2023',
      points: [
        'Supported operation and maintenance activities at 33/11 kV substations.',
        'Observed and assisted with control room operations.',
        'Conducted field visits and reviewed daily operational reports.',
        'Gained practical exposure to power distribution systems and field operations.'
      ]
    }
  ]);

  const [highlights, setHighlights] = useState([
    { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
    { metric_value: "15+", metric_label: "CAD & Engineering Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
    { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
    { metric_value: "6+", metric_label: "Core Industry Tools", metric_subtext: "AutoCAD, GIS, ETAP, MATLAB" },
  ]);

  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');

  // Hydrate content from /api/content
  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/content');
        if (!res.ok) return;
        const data = await res.json();
        if (data.hero && data.hero.name) {
          setHeroData(data.hero);
        }
        if (Array.isArray(data.highlights) && data.highlights.length > 0) {
          setHighlights(data.highlights);
        }
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjectsData(data.projects.map((p, i) => ({
            id: p.project_number || String(i + 1).padStart(2, '0'),
            title: p.title,
            description: p.short_description || p.full_description,
            tags: p.tags || []
          })));
        }
        if (Array.isArray(data.experiences) && data.experiences.length > 0) {
          setExperiences(data.experiences.map(e => ({
            role: e.role,
            organization: e.organization,
            period: e.period,
            points: e.description_points || []
          })));
        }
        if (data.resume && data.resume.file_url) {
          setResumeUrl(data.resume.file_url);
        }
      } catch (err) {
        // Fallbacks remain intact
        console.log("Using static content fallback:", err);
      }
    }
    loadContent();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Submit directly to SQLite contact inbox via Next.js API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // Continue to mailto fallback
    } finally {
      setSubmitting(false);
      setFormSubmitted(true);
      const mailtoUrl = `mailto:ashifur.badhon@gmail.com?subject=${encodeURIComponent(
        formData.subject + ' - from ' + formData.name
      )}&body=${encodeURIComponent(
        'Sender Name: ' + formData.name + '\nSender Email: ' + formData.email + '\n\nMessage:\n' + formData.message
      )}`;
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);
    }
  };

  return (
    <div className="bg-[#0b0f17] text-white min-h-screen font-sans selection:bg-[#10B981] selection:text-black">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-teal-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-emerald-700/5 blur-[140px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f17]/90 border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-black transition duration-300">
              <Zap size={18} />
            </div>
            <h1 className="text-2xl font-black tracking-widest text-[#10B981]">
              ASHIFUR<span className="text-white font-light text-base ml-1">.EEE</span>
            </h1>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider">
            <a href="#about" className="text-gray-300 hover:text-[#10B981] transition">About</a>
            <a href="#experience" className="text-gray-300 hover:text-[#10B981] transition">Experience</a>
            <a href="#projects" className="text-gray-300 hover:text-[#10B981] transition">Projects</a>
            <a href="#skills" className="text-gray-300 hover:text-[#10B981] transition">Skills</a>
            <a href="#education" className="text-gray-300 hover:text-[#10B981] transition">Education</a>
            <a href="#contact" className="text-gray-300 hover:text-[#10B981] transition">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setResumeModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 text-gray-200 text-xs font-semibold flex items-center gap-2 transition"
            >
              <FileText size={15} className="text-[#10B981]" /> Resume
            </button>
            <a
              href="mailto:ashifur.badhon@gmail.com"
              className="bg-[#10B981] text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition duration-300"
            >
              <Mail size={16} /> Get In Touch
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0e1420] border-b border-[#1e2638] px-6 py-5 space-y-4">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">About</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">Experience</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">Projects</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">Skills</a>
            <a href="#education" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">Education</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#10B981]">Contact</a>
            <button
              onClick={() => { setMobileMenuOpen(false); setResumeModalOpen(true); }}
              className="w-full text-left py-2 text-sm font-semibold text-[#10B981] flex items-center gap-2"
            >
              <FileText size={16} /> View & Download CV
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              {heroData.badge_text || "Available for Engineering, Technology & AI Opportunities"}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {heroData.name || "ASHIFUR RAHMAN"}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400 text-2xl sm:text-4xl mt-2 font-bold font-mono">
                {heroData.title || "Electrical & Electronic Engineer"}
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {heroData.introduction}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#contact"
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300"
              >
                <Zap size={16} /> {heroData.primary_btn_text || "Contact Me"}
              </a>
              <button
                onClick={() => setResumeModalOpen(true)}
                className="bg-[#111622] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 hover:bg-[#161e30] transition duration-300"
              >
                <Download size={16} /> {heroData.secondary_btn_text || "Download CV"}
              </button>
            </div>
          </div>

          {/* Profile Photo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#10B981] to-teal-600 opacity-30 blur-xl group-hover:opacity-60 transition duration-500" />
              
              <div className="relative bg-[#111622] border-2 border-[#1e2638] rounded-3xl p-4 shadow-2xl">
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden bg-[#0b0f17]">
                  <Image
                    src={heroData.profile_image || "/ashifur.jpeg"}
                    alt="Ashifur Rahman"
                    fill
                    className="object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#10B981]">
                      {heroData.spec_badge_label || "Specialization"}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {heroData.spec_badge_title || "Engineering, Management & AI"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Metrics / Highlights Bar */}
      <section className="relative z-10 border-y border-[#1e2638] bg-[#0e131d]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {highlights.map((h, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-[#10B981] font-mono">{h.metric_value}</p>
              <p className="text-sm font-semibold text-white">{h.metric_label}</p>
              <p className="text-xs text-gray-400">{h.metric_subtext}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981]">About Ashifur</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Engineering Reliability, Efficiency & Innovation
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Electrical &amp; Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300">
              <Zap className="text-[#10B981] mb-3" size={28} />
              <h4 className="text-base font-bold text-white mb-1">Substation Engineering</h4>
              <p className="text-xs text-gray-400">Transformers, switchgear, protective relays, and load flow maintenance.</p>
            </div>
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300">
              <Monitor className="text-[#10B981] mb-3" size={28} />
              <h4 className="text-base font-bold text-white mb-1">AutoCAD Electrical</h4>
              <p className="text-xs text-gray-400">Single Line Diagrams (SLD), wiring schematics, and substation layout drafting.</p>
            </div>
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300">
              <Database className="text-[#10B981] mb-3" size={28} />
              <h4 className="text-base font-bold text-white mb-1">GIS Utility Mapping</h4>
              <p className="text-xs text-gray-400">Spatial data analysis, distribution network routing, and asset geodatabases.</p>
            </div>
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300">
              <Briefcase className="text-[#10B981] mb-3" size={28} />
              <h4 className="text-base font-bold text-white mb-1">Sales & Project Analytics</h4>
              <p className="text-xs text-gray-400">BOQ preparation, equipment sizing, proposal formulation, and Excel analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="relative z-10 px-6 md:px-12 py-20 bg-[#111622] border-y border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Technical Matrix</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Technical Skills</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillsData.map((cat, idx) => {
              const Icon = cat.icon || Monitor;
              return (
                <div key={idx} className="bg-[#0b0f17] p-6 rounded-2xl border border-[#1e2638] space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#1e2638]">
                    <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-white">{cat.category}</h4>
                  </div>
                  <div className="space-y-3 pt-2">
                    {cat.items.map((skill, sIdx) => (
                      <div key={sIdx}>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-gray-200">{skill.name}</span>
                          <span className="text-[#10B981] font-mono">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-[#1e2638] rounded-full h-1.5">
                          <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Skill Badges */}
          <div className="mt-8 pt-8 border-t border-[#1e2638] flex flex-wrap justify-center gap-3">
            {['AutoCAD', 'PSNA', 'GIS', 'MATLAB', 'ETAP', 'MS Excel', 'Power Distribution', 'Relay Testing'].map((skill) => (
              <span key={skill} className="bg-[#1a202c] px-4 py-2 rounded-lg border border-gray-800 text-xs font-semibold flex items-center gap-2 text-gray-200">
                <Check size={14} className="text-[#10B981]" /> {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="relative z-10 px-6 md:px-12 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Professional Journey</p>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white">Work Experience</h3>
        </div>

        <div className="border-l-2 border-[#1e2638] ml-4 md:ml-8 space-y-10">
          {experiences.map((exp, idx) => (
            <div key={idx} className="relative pl-8 md:pl-10">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#10B981] ring-4 ring-[#0b0f17]" />
              <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-lg font-bold text-white">{exp.role}</h4>
                  <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full w-fit">
                    {exp.period}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-300">{exp.organization}</p>
                <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative z-10 px-6 md:px-12 py-20 bg-[#0e131d] border-y border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Case Studies</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Engineering Projects</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.map((proj) => (
              <div
                key={proj.id}
                className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 flex flex-col justify-between hover:border-[#10B981]/40 hover:scale-[1.01] transition duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded">
                      PROJECT #{proj.id}
                    </span>
                    <FolderGit2 className="text-gray-500 group-hover:text-[#10B981] transition" size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2.5 group-hover:text-[#10B981] transition">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    {proj.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1e2638]/70">
                  {proj.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[11px] font-mono text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Credentials */}
      <section id="education" className="relative z-10 px-6 md:px-12 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Academic Background</p>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white">Education & Credentials</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">Bachelor of Science</span>
              <h4 className="text-lg font-bold text-white mt-1">Electrical & Electronic Engineering</h4>
              <p className="text-sm text-gray-400 mt-1">Accredited Engineering University Program</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-[#1e2638]">
              Comprehensive core coursework in Power Systems Analysis, High Voltage Engineering, Electrical Machines, Telecommunications, and Control Systems.
            </p>
          </div>

          <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">Certifications & Training</span>
              <h4 className="text-lg font-bold text-white mt-1">Specialized Engineering Modules</h4>
              <p className="text-sm text-gray-400 mt-1">Industry Standards & Practical Software</p>
            </div>
            <ul className="text-xs text-gray-400 space-y-2 pt-2 border-t border-[#1e2638]">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#10B981]" /> AutoCAD Electrical 2D & SLD Master Certification
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#10B981]" /> Substation Operations & High Voltage Safety Protocols
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#10B981]" /> GIS Spatial Data Analysis & Utility Network Management
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-6 md:px-12 py-24 bg-[#0b0f17] border-t border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981]">Get In Touch</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Let's Discuss Engineering Solutions</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Whether you have an engineering project, electrical design requirement, data and operations task, AI-related opportunity, or technical role, feel free to reach out.
              </p>

              <div className="space-y-4 pt-4">
                <a
                  href="mailto:ashifur.badhon@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Direct Email</p>
                    <p className="text-sm font-semibold text-white">ashifur.badhon@gmail.com</p>
                  </div>
                </a>

                {/* Phone Call */}
                <a
                  href="tel:+8801521417284"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Direct Phone Call</p>
                    <p className="text-sm font-semibold text-white">+880 1521 417284</p>
                  </div>
                </a>

                {/* WhatsApp Chat */}
                <a
                  href="https://wa.me/8801521417284"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-emerald-400 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">WhatsApp Instant Chat</p>
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">+880 1521 417284</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </a>

                <a
                  href="https://www.linkedin.com/in/ashifurrahmanbadhon"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition">
                    <LinkedinIcon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">LinkedIn Profile</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">linkedin.com/in/ashifurrahmanbadhon</p>
                  </div>
                </a>

                <a
                  href="https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#161e30] transition group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Location</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">Tangail, Dhaka, Bangladesh</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#111622] p-8 md:p-10 rounded-2xl border border-[#1e2638] relative">
              <h3 className="text-xl font-bold text-white mb-2">Send a Message</h3>
              <p className="text-xs text-gray-400 mb-6">Fill out this quick form to send a direct message to Ashifur's inbox.</p>

              {formSubmitted && (
                <div className="mb-6 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                  <Check size={16} /> Inquiry recorded in database! Opening your email client to dispatch the message...
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Subject / Inquiry</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Substation Consultation / Project Opportunity"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detail your engineering requirements, project timeline, or job inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-lg bg-[#10B981] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} /> {submitting ? "Sending Inquiry..." : "Send Direct Message"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2638] bg-[#080c13] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Ashifur Rahman. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-gray-400">Electrical &amp; Electronic Engineer</span>
            <Link
              href="/admin"
              className="text-gray-500 hover:text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 transition"
            >
              <Lock size={12} /> Central CMS
            </Link>
          </div>
        </div>
      </footer>

      {/* Resume Modal */}
      {resumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl max-w-md w-full p-6 space-y-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setResumeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/30">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Ashifur Rahman - Curriculum Vitae</h3>
              <p className="text-xs text-gray-400">
                Electrical & Electronic Engineer with Substation, CAD, GIS, and Analytics experience.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={resumeUrl}
                download="Ashifur_Rahman_CV.pdf"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-lg bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#059669] transition"
              >
                <Download size={16} /> Download Official PDF CV
              </a>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-lg bg-[#0b0f17] text-white border border-[#1e2638] hover:border-[#10B981]/50 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={16} /> View CV in Browser Tab
              </a>
              <a
                href="mailto:ashifur.badhon@gmail.com?subject=Request%20for%20Ashifur%20Rahman%20Full%20Resume"
                className="w-full py-2 text-gray-400 hover:text-[#10B981] font-mono text-xs flex items-center justify-center gap-1 transition"
              >
                <Mail size={14} /> Request Custom CV via Email
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
