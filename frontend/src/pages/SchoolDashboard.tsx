import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  DollarSign,
  CreditCard,
  BookOpen,
  Calendar,
  ClipboardList,
  UserCheck,
  FileSpreadsheet,
  Clock,
  Library,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  ArrowUpRight,
  Megaphone,
} from 'lucide-react';

export const SchoolDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(19);

  const quickModules = [
    { id: 'students', name: 'Students', icon: GraduationCap, count: '1,420' },
    { id: 'staff', name: 'Staff', icon: Users, count: '84' },
    { id: 'fees', name: 'Fees', icon: DollarSign, count: '₹4.2L' },
    { id: 'subjects', name: 'Subjects', icon: BookOpen, count: '28' },
    { id: 'classes', name: 'Classes', icon: Building2, count: '14' },
    { id: 'attendance', name: 'Attendance', icon: UserCheck, count: '96%' },
    { id: 'examinations', name: 'Examinations', icon: FileSpreadsheet, count: 'Term 1' },
    { id: 'leave', name: 'Leave', icon: Clock, count: '3 req' },
    { id: 'library', name: 'Library', icon: Library, count: '3,800' },
  ];

  const notices = [
    {
      id: 'n1',
      title: 'bring political map',
      description: 'compulsory to bring that for all 9th & 10th grade Social Science sections',
      date: '2026-09-19',
      author: 'Aakash Mehra',
      priority: 'High',
      priorityClass: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'n2',
      title: 'holidays',
      description: 'kal ki chutti hai on occasion of Autumn Regional Festival',
      date: '2026-09-19',
      author: 'kartikey',
      priority: 'Medium',
      priorityClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    },
    {
      id: 'n3',
      title: 'Quarter 3 Fee Submission',
      description: 'Parents are requested to clear term fees by 25th September via ERP counter or UPI',
      date: '2026-09-20',
      author: 'Accounts Dept',
      priority: 'Notice',
      priorityClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              MPS
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-950 tracking-tight leading-tight">Mps world school</div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-zinc-500">Session 2026–2027</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          <div>
            <div className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Student Management</div>
            <nav className="space-y-1">
              <a
                href="#students"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-zinc-500" />
                  <span>Students</span>
                </div>
                <span className="text-xs bg-zinc-100 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">1,420</span>
              </a>
              <a
                href="#admissions"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <ClipboardList className="w-4 h-4 text-zinc-500" />
                <span>Admissions</span>
              </a>
            </nav>
          </div>

          <div>
            <div className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Staff Management</div>
            <nav className="space-y-1">
              <a
                href="#teaching"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <Users className="w-4 h-4 text-zinc-500" />
                <span>Teaching Staff</span>
              </a>
              <a
                href="#non-teaching"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <Briefcase className="w-4 h-4 text-zinc-500" />
                <span>Non-Teaching Staff</span>
              </a>
            </nav>
          </div>

          <div>
            <div className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Fees & Finance</div>
            <nav className="space-y-1">
              <a
                href="#payroll"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <DollarSign className="w-4 h-4 text-zinc-500" />
                <span>Payroll & Salary</span>
              </a>
              <a
                href="#fees"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <span>Fee Counter</span>
              </a>
            </nav>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-zinc-200">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                k
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-950 leading-tight">kartikey</div>
                <div className="text-[11px] text-zinc-500 font-medium">School Admin</div>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/60 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-zinc-950">Mps world school</h1>
            <p className="text-xs text-zinc-500 font-medium">Session 2026–2027 • EduNex Admin</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, staff, invoices, notices..."
                className="w-full pl-10 pr-12 py-2 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-200/70 rounded border border-zinc-300">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-bold text-[10px] flex items-center justify-center rounded-full ring-2 ring-white">
                2
              </span>
            </button>

            <div className="flex items-center space-x-2.5 pl-3 border-l border-zinc-200">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 flex items-center justify-center font-bold text-xs uppercase">
                k
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-zinc-950 leading-tight">kartikey</div>
                <div className="text-[10px] text-zinc-500 font-medium">School Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Quick Actions Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions & Core Modules</h2>
              <span className="text-xs text-zinc-500">9 Active Modules</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
              {quickModules.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    className="flex flex-col items-center p-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl transition-all hover:border-zinc-400 hover:-translate-y-0.5 shadow-sm group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-900 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 text-center">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Columns: Calendar + Notice Board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Academic Calendar */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-base font-bold text-zinc-950">Academic Calendar</h3>
                    <p className="text-xs text-zinc-500 font-medium">Session Schedule & Key Events</p>
                  </div>
                  <span className="text-xs bg-zinc-100 text-zinc-800 font-semibold px-2.5 py-1 rounded-lg border border-zinc-200">
                    Term 1
                  </span>
                </div>

                <div className="flex items-center justify-between mt-5 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">September 2026</h4>
                    <p className="text-[11px] text-zinc-400">Previous: August 2026</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400 py-1.5 mb-1">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                  <span className="p-2 text-zinc-300">30</span>
                  <span className="p-2 text-zinc-300">31</span>
                  {[...Array(30)].map((_, i) => {
                    const day = i + 1;
                    const isSelected = day === selectedDay;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`p-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-zinc-950 text-white font-bold shadow-sm'
                            : 'hover:bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <div className="flex items-start space-x-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="w-2 h-2 rounded-full bg-zinc-950 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Today's Academic Schedule</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Classes 9 & 10 Geography Practical Lab • 10:30 AM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice Board */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-base font-bold text-zinc-950">Notice Board</h3>
                    <p className="text-xs text-zinc-500 font-medium">Latest circulars and announcements</p>
                  </div>
                  <button className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                    <span>All notices</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all flex items-start justify-between"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-950">{n.title}</h4>
                          <p className="text-xs text-zinc-600 mt-0.5">{n.description}</p>
                          <div className="flex items-center space-x-2 mt-2 text-[11px] text-zinc-400 font-medium">
                            <span>{n.date}</span>
                            <span>•</span>
                            <span>{n.author}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${n.priorityClass}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{n.priority}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total 12 active notices published</span>
                <button className="inline-flex items-center space-x-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Notice</span>
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
