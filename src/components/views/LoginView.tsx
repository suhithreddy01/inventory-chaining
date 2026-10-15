import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Boxes,
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  KeyRound,
  Trash2,
  Zap,
  FlaskConical,
  AtSign,
  ShieldAlert
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    login,
    registerAccount,
    verifyLogin,
    loginWithoutPassword,
    registeredUsers,
    deleteAccount,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [selectedUser, setSelectedUser] = useState<User>(registeredUsers[0] || null);
  const [inputIdentifier, setInputIdentifier] = useState(
    registeredUsers[0]?.username || registeredUsers[0]?.email || ''
  );
  const [password, setPassword] = useState('lab2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign Up State (Username & Custom Password support)
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newStation, setNewStation] = useState('Station #05 - Assembly Cell');
  const [enablePassword, setEnablePassword] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Auto-generate suggested username from full name
  const handleFullNameChange = (val: string) => {
    setNewFullName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!newUsername || newUsername.startsWith(slug.slice(0, 3))) {
      setNewUsername(slug);
    }
  };

  // Select user station card
  const handleSelectStation = (user: User) => {
    setSelectedUser(user);
    setInputIdentifier(user.username || user.email);
    setErrorMsg(null);
    if (user.password) {
      setPassword(user.password);
    } else {
      setPassword('');
    }
  };

  // 1-Click Fast Login for a selected user card
  const handleQuickLoginUser = (user: User) => {
    setErrorMsg(null);
    if (user.password) {
      const res = verifyLogin(user.username || user.email, user.password);
      if (!res.success) {
        setSelectedUser(user);
        setInputIdentifier(user.username || user.email);
        setErrorMsg(res.message || 'Password required');
      }
    } else {
      login(user);
    }
  };

  // Sign in submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const query = inputIdentifier.trim() || selectedUser?.username || selectedUser?.email || '';
    if (!query) {
      setErrorMsg('Please enter a username or email address.');
      return;
    }

    // Call verifyLogin to validate password against the specific username
    const result = verifyLogin(query, password);
    if (!result.success) {
      setErrorMsg(result.message || 'Login verification failed.');
      return;
    }
  };

  // Account creation submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newFullName.trim()) {
      setErrorMsg('Please enter your full name or station title.');
      return;
    }

    const cleanUsername = (newUsername.trim() || newEmail.split('@')[0] || newFullName.replace(/\s+/g, '_'))
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9_.-]/g, '');

    if (!cleanUsername) {
      setErrorMsg('Please provide a valid username containing letters, numbers, or underscores.');
      return;
    }

    // Check if username is already taken
    const existing = registeredUsers.find(
      u => u.username?.toLowerCase() === cleanUsername
    );
    if (existing) {
      setErrorMsg(`Username "@${cleanUsername}" is already taken. Please choose another username.`);
      return;
    }

    if (!newEmail.trim()) {
      setErrorMsg('Please enter an email or student ID.');
      return;
    }

    if (enablePassword) {
      if (!newPassword || newPassword.length < 4) {
        setErrorMsg('Please set a password with at least 4 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter matching passwords.');
        return;
      }
    }

    // Register with customized username and optional/custom password
    const newUser = registerAccount({
      name: newFullName.trim(),
      username: cleanUsername,
      email: newEmail.trim(),
      password: enablePassword ? newPassword.trim() : undefined,
      role: newRole,
      station: newStation.trim() || 'Custom Lab Station'
    });

    login(newUser);
  };

  const roleMeta = {
    student: { label: 'Student', icon: GraduationCap, color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' },
    instructor: { label: 'Instructor', icon: ShieldCheck, color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' },
    operator: { label: 'Operator', icon: Building2, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' },
    researcher: { label: 'Researcher', icon: FlaskConical, color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Academic Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-white font-mono">
                Inventory Chaining – Technical Training Lab
              </div>
              <div className="text-[11px] text-blue-400 font-medium">
                Academic Project • College Technical Simulation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Custom Password & Password-Free Access Supported</span>
            <span className="sm:hidden">Auth Ready</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Educational Overview & 5-Stage Pipeline */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Technical Training Lab Node</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                INVENTORY CHAINING
              </h1>
              <p className="text-sm sm:text-base font-semibold text-blue-300 font-mono">
                Understanding the Flow | Managing the Stock | Building an Efficient Supply Chain
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
              Explore how raw materials, assemblies, and finished stock move through sequential supply chain tiers.
              Observe reorder points, lead-time latencies, holding costs, and customer demand shocks in real-time.
            </p>

            {/* Visual 5-Stage Pipeline Breadcrumb */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Multi-Echelon Chaining Pipeline</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  Supplier
                </span>
                <span className="text-slate-500">→</span>
                <span className="px-2 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-700/50">
                  Manufacturer
                </span>
                <span className="text-slate-500">→</span>
                <span className="px-2 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  Distributor
                </span>
                <span className="text-slate-500">→</span>
                <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  Retailer
                </span>
                <span className="text-slate-500">→</span>
                <span className="px-2 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  Customer
                </span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Custom Password or Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Username-bound Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bullwhip Effect Shock</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7 Academic PDF Reports</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card with Tabs */}
          <div className="lg:col-span-7 bg-slate-800/90 rounded-2xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Top Switcher Tabs: Sign In vs Create Account */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account (Set Password)</span>
                </button>
              </div>

              {/* Quick 1-click Demo Button */}
              <button
                type="button"
                onClick={() => login(registeredUsers[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-sm cursor-pointer"
                title="1-click demo entry as Student Alex Vance"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">1-Click Demo</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN (PASSWORD OR PASSWORDLESS) */}
            {mode === 'signin' && (
              <div className="space-y-4">
                {/* Saved Stations 1-Click Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Select A Registered Station Account:</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {registeredUsers.length} Stations Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {registeredUsers.map(u => {
                      const isSelected = selectedUser?.id === u.id;
                      const RoleIcon = roleMeta[u.role]?.icon || GraduationCap;
                      const badgeClass = roleMeta[u.role]?.color || 'text-blue-400 bg-blue-500/20';
                      const isCustom = !['USR-01', 'USR-02', 'USR-03'].includes(u.id);
                      const hasPassword = Boolean(u.password && u.password.length > 0);

                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectStation(u)}
                          className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50'
                              : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeClass} flex items-center gap-1`}
                              >
                                <RoleIcon className="w-3 h-3" />
                                {u.role}
                              </span>

                              <div className="flex items-center gap-1">
                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      deleteAccount(u.id);
                                    }}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                    title="Delete custom station"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                                <span className="w-6 h-6 rounded-full bg-slate-700 text-blue-300 font-bold text-[10px] flex items-center justify-center font-mono">
                                  {u.avatarText}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs font-bold text-white truncate" title={u.name}>
                              {u.name}
                            </div>
                            <div className="text-[10px] text-blue-300 font-mono truncate" title={`@${u.username || u.email}`}>
                              @{u.username || u.email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={u.station}>
                              {u.station}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-700/50">
                            {hasPassword ? (
                              <span className="text-[9px] text-amber-300/90 font-mono flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5 text-amber-400" />
                                Password
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-300/90 font-mono flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-emerald-400" />
                                No Password
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleQuickLoginUser(u);
                              }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
                            >
                              <span>Enter</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form to enter Username and Password */}
                <form onSubmit={handleSignInSubmit} className="space-y-3.5 pt-2 border-t border-slate-700/60">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username or Registered Email
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={inputIdentifier}
                        onChange={e => {
                          setInputIdentifier(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="e.g. alex_vance or student@lab.edu"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Account Password
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Leave blank only if account has no password set
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="Enter password configured for this username..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Credentials Pills */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        Default Lab Credentials:
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Click to test</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInputIdentifier('alex_vance');
                          setPassword('lab2026');
                          setErrorMsg(null);
                        }}
                        className="px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-mono text-[10px] transition-colors cursor-pointer"
                      >
                        @alex_vance : <span className="text-white">lab2026</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputIdentifier('prof_miller');
                          setPassword('admin2026');
                          setErrorMsg(null);
                        }}
                        className="px-2 py-1 rounded-md bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-[10px] transition-colors cursor-pointer"
                      >
                        @prof_miller : <span className="text-white">admin2026</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputIdentifier('marcus_chen');
                          setPassword('operator2026');
                          setErrorMsg(null);
                        }}
                        className="px-2 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] transition-colors cursor-pointer"
                      >
                        @marcus_chen : <span className="text-white">operator2026</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <span>Sign In & Authorize Station</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CREATE ACCOUNT (WITH USERNAME & CUSTOM PASSWORD) */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-white">Create Account & Set Custom Password:</strong>
                    <span>
                      Choose your own username and password below. Your custom password will be securely bound to your username.
                      (You can also toggle off password protection if you prefer 1-click passwordless access).
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name / Student Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={e => handleFullNameChange(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Unique Username <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-slate-400 font-mono">@identifier</span>
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        placeholder="e.g. maya_lin"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address / Student ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="e.g. maya@lab.edu"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Lab Station Role
                    </label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="student">🎓 Student / Trainee</option>
                      <option value="instructor">👨‍🏫 Instructor / Faculty</option>
                      <option value="operator">🏭 Operator / Logistics</option>
                      <option value="researcher">🔬 Researcher / Analyst</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Station Name / Workspace
                  </label>
                  <input
                    type="text"
                    value={newStation}
                    onChange={e => setNewStation(e.target.value)}
                    placeholder="e.g. Station #06 - Robotics Cell"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Password Setting Section */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enablePassword}
                        onChange={e => setEnablePassword(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        Set Custom Password For This Username
                      </span>
                    </label>

                    <span className="text-[10px] text-slate-400">
                      {enablePassword ? 'Password Protection ON' : 'Password-Free Mode'}
                    </span>
                  </div>

                  {enablePassword ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Choose Your Password
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required={enablePassword}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Min. 4 characters..."
                              className="w-full pl-8 pr-9 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                              {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required={enablePassword}
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="Re-type password..."
                              className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>This password will be required when signing in with username <strong>@{newUsername || 'username'}</strong>.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Passwordless mode: This account can be accessed anytime with 1 click without entering a password.</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Log In ({enablePassword ? 'With Custom Password' : 'Password-Free'})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Small Academic Project Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Inventory Chaining – Technical Training Lab | Academic Project</span>
          <span className="font-mono text-[11px] text-slate-400">
            Supplier → Manufacturer → Distributor → Retailer → Customer
          </span>
        </div>
      </footer>
    </div>
  );
};
