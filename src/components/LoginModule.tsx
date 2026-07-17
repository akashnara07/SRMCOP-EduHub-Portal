import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Library, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Lock, 
  User, 
  IdCard, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

interface LoginModuleProps {
  onLogin: (role: 'Student' | 'Faculty' | 'Admin') => void;
}

export default function LoginModule({ onLogin }: LoginModuleProps) {
  // Modes: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Selected roles
  const [loginRole, setLoginRole] = useState<'Student' | 'Faculty' | 'Admin'>('Student');
  const [registerRole, setRegisterRole] = useState<'Student' | 'Faculty'>('Student');
  
  // Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Student Registration States
  const [studentName, setStudentName] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  
  // Faculty Registration States
  const [facultyName, setFacultyName] = useState('');
  const [facultyEmpId, setFacultyEmpId] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [facultyConfirmPassword, setFacultyConfirmPassword] = useState('');
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback alerts
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Auto-dismiss feedback notifications
  const triggerNotification = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Login handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: DEVELOPMENT MODE ONLY
    // Replace temporary role-based login bypass with Firebase Authentication before production release.
    onLogin(loginRole);
  };

  // Registration handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show temporary registration feedback
    triggerNotification(
      'info',
      'Registration is currently in testing mode. Account creation will be enabled when authentication is activated.'
    );
  };

  // Password recovery handler
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show temporary reset password feedback
    triggerNotification(
      'info',
      'Password recovery will be available when authentication is activated.'
    );
  };

  // Dynamic description based on active role
  const getRoleDescription = () => {
    switch (loginRole) {
      case 'Student':
        return '';
      case 'Faculty':
        return '';
      case 'Admin':
        return 'Supervise courses and programs, allot faculty roles, update registries, and manage the institutional calendar.';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFE] flex items-stretch font-sans text-slate-800 selection:bg-[#8B1E3F]/10 relative overflow-hidden" id="auth-portal-container">
      {/* Absolute Decorative Blobs for Ambient Glass Look */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8B1E3F] blur-[140px] opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#CD4368] blur-[120px] opacity-[0.05] pointer-events-none" />

      {/* Grid container spanning full screen */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ==================================================
            LEFT SIDE: INFORMATION & BRANDING PANEL (5 cols)
            ================================================== */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF8FA] via-[#FFFDFE] to-[#FFF3F6] border-r border-[#8B1E3F]/5 px-8 py-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background overlay circles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#8B1E3F]/2 blur-3xl pointer-events-none" />
          
          {/* Branding Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white shadow-md shadow-maroon-900/10 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-black text-[10px] uppercase tracking-widest text-[#8B1E3F] leading-none mb-1">
                  SRM College of Pharmacy
                </h2>
                <h1 className="font-display font-black text-xl text-gray-900 leading-none">
                  Edu<span className="text-[#8B1E3F]">Hub</span>
                </h1>
              </div>
            </div>

            {/* Headline and Supporting statement */}
            <div className="mt-8">
              <h3 className="font-display font-extrabold text-3xl lg:text-4xl text-gray-900 tracking-tight leading-tight">
                Learning. Teaching.<br />
                Progress. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1E3F] to-[#CD4368]">Connected.</span>
              </h3>
              <p className="text-sm font-semibold text-gray-600 mt-3.5 leading-relaxed">
                One unified academic platform for the SRM College of Pharmacy community.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed">
                Access curriculum, courses, learning resources, academic progress, announcements, and academic calendars from one connected academic workspace.
              </p>
            </div>

            {/* Compact Features List - 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {/* Feature 1 */}
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B1E3F]/5 flex gap-3 transition-all hover:bg-white/90">
                <div className="w-8 h-8 rounded-xl bg-[#8B1E3F]/5 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 leading-snug">Curriculum & Courses</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Structured PCI courses.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B1E3F]/5 flex gap-3 transition-all hover:bg-white/90">
                <div className="w-8 h-8 rounded-xl bg-[#8B1E3F]/5 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <Library className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 leading-snug">Learning Resources</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Faculty lecture materials.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B1E3F]/5 flex gap-3 transition-all hover:bg-white/90">
                <div className="w-8 h-8 rounded-xl bg-[#8B1E3F]/5 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 leading-snug">Academic Progress</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Track internal assessments.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B1E3F]/5 flex gap-3 transition-all hover:bg-white/90">
                <div className="w-8 h-8 rounded-xl bg-[#8B1E3F]/5 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 leading-snug">Schedules & Updates</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Live academic calendars.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Footer */}
          <div className="border-t border-gray-100 pt-6 mt-8">
            <h4 className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider">
              SRM College of Pharmacy
            </h4>
            <p className="text-[9px] text-gray-400 font-medium mt-1 leading-normal">
              © 2026 SRM College of Pharmacy • EduHub Academic Portal • All rights reserved. Registered under PCI specifications.
            </p>
          </div>
        </div>

        {/* ==================================================
            RIGHT SIDE: ACTIVE FORM PANEL CARD (7 cols)
            ================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16">
          
          {/* Glassmorphic Form Card Wrapper */}
          <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-[0_12px_40px_rgba(139,30,63,0.04)] p-8 sm:p-10 transition-all duration-300 relative overflow-hidden" id="auth-glass-card">
            
            {/* Top red ambient accent pill */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8B1E3F] via-[#CD4368] to-[#8B1E3F]" />

            {/* Notifications / Error Banner */}
            {notification && (
              <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border transition-all animate-fade-in ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <p className="text-xs font-semibold leading-relaxed">
                  {notification.message}
                </p>
              </div>
            )}

            {/* ==========================================
                MODE 1: LOGIN MODE
                ========================================== */}
            {mode === 'login' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
                    Welcome to EduHub
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1.5">
                    Sign in to access your academic workspace.
                  </p>
                </div>

                {/* SEGMENTED ROLE SELECTOR */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Select Your Workspace Role
                  </label>
                  
                  <div className="p-1.5 bg-gray-100/70 backdrop-blur-md rounded-full flex gap-1 border border-gray-200/50 select-none">
                    {(['Student', 'Faculty', 'Admin'] as const).map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => {
                          setLoginRole(role);
                        }}
                        className={`
                          flex-1 text-xs font-bold py-2.5 px-3 rounded-full transition-all duration-300 whitespace-nowrap
                          ${loginRole === role
                            ? 'bg-[#8B1E3F] text-white shadow-sm font-extrabold'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/30'
                          }
                        `}
                      >
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtext description adapts based on active role */}
                {getRoleDescription() && (
                  <div className="p-3.5 rounded-2xl bg-[#8B1E3F]/3 border border-[#8B1E3F]/5 flex gap-2.5 items-start">
                    <Info className="w-4 h-4 text-[#8B1E3F] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-600 leading-normal font-semibold">
                      {getRoleDescription()}
                    </p>
                  </div>
                )}

                {/* LOGIN FORM */}
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Institutional Email / User ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ex: akash.j@srmcop.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-10 py-3 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500 font-bold">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                      />
                      Remember Me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotEmail(email);
                      }}
                      className="text-[#8B1E3F] hover:underline font-bold transition-all"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] hover:from-[#761935] hover:to-[#b63c5c] text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    SIGN IN <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* CREATE ACCOUNT OPTION - HIDDEN WHEN ADMIN IS SELECTED */}
                {loginRole !== 'Admin' && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="text-xs text-gray-400 font-bold">New to SRMCOP EduHub?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterRole(loginRole === 'Student' ? 'Student' : 'Faculty');
                          setMode('register');
                        }}
                        className="text-xs text-[#8B1E3F] hover:underline font-black uppercase tracking-wider"
                      >
                        CREATE ACCOUNT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                MODE 2: REGISTRATION MODE
                ========================================== */}
            {mode === 'register' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all shrink-0"
                    title="Back to Sign In"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
                      Create Account
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Register to enroll in the EduHub portal system.
                    </p>
                  </div>
                </div>

                {/* Segmented Selector (STUDENT | FACULTY ONLY) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Select Registration Type
                  </label>
                  
                  <div className="p-1 bg-gray-100/70 rounded-full flex gap-1 border border-gray-200/50">
                    {(['Student', 'Faculty'] as const).map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => {
                          setRegisterRole(role);
                        }}
                        className={`
                          flex-1 text-xs font-bold py-2 px-3 rounded-full transition-all duration-300
                          ${registerRole === role
                            ? 'bg-[#8B1E3F] text-white shadow-sm font-extrabold'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/30'
                          }
                        `}
                      >
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC FORM REGISTRATION */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Common fields */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Akash J"
                        value={registerRole === 'Student' ? studentName : facultyName}
                        onChange={(e) => registerRole === 'Student' ? setStudentName(e.target.value) : setFacultyName(e.target.value)}
                        className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Conditional Registry ID */}
                  {registerRole === 'Student' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Register Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <IdCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Ex: SRM2026PH7810"
                          value={studentRegNo}
                          onChange={(e) => setStudentRegNo(e.target.value)}
                          className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Employee ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <IdCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Ex: SRM-FAC-1004"
                          value={facultyEmpId}
                          onChange={(e) => setFacultyEmpId(e.target.value)}
                          className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Institutional Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Ex: akash.j@srmcop.edu.in"
                        value={registerRole === 'Student' ? studentEmail : facultyEmail}
                        onChange={(e) => registerRole === 'Student' ? setStudentEmail(e.target.value) : setFacultyEmail(e.target.value)}
                        className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={registerRole === 'Student' ? studentPassword : facultyPassword}
                          onChange={(e) => registerRole === 'Student' ? setStudentPassword(e.target.value) : setFacultyPassword(e.target.value)}
                          className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={registerRole === 'Student' ? studentConfirmPassword : facultyConfirmPassword}
                          onChange={(e) => registerRole === 'Student' ? setStudentConfirmPassword(e.target.value) : setFacultyConfirmPassword(e.target.value)}
                          className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Show checkbox */}
                  <div className="flex items-center gap-2 justify-end text-xs pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-500 font-bold select-none">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => {
                          setShowPassword(e.target.checked);
                          setShowConfirmPassword(e.target.checked);
                        }}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                      />
                      Show Passwords
                    </label>
                  </div>

                  {/* Submit Registration button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] hover:from-[#761935] hover:to-[#b63c5c] text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    CREATE ACCOUNT
                  </button>
                </form>

                {/* Back to sign in */}
                <div className="pt-4 border-t border-gray-100 text-center">
                  <span className="text-xs text-gray-400 font-bold">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-[#8B1E3F] hover:underline font-black uppercase tracking-wider"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                MODE 3: FORGOT PASSWORD MODE
                ========================================== */}
            {mode === 'forgot' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all shrink-0"
                    title="Back to Sign In"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
                      Reset Password
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Recover access to your academic account.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-pink-50/50 border border-pink-100/50 rounded-2xl flex gap-2.5 items-start">
                  <Info className="w-4.5 h-4.5 text-[#8B1E3F] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-600 leading-normal font-semibold">
                    Enter your institutional email address and we will generate an active recovery link for authentication testing.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Ex: akash.j@srmcop.edu.in"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-gray-100/50 border border-gray-200/60 hover:border-gray-300 focus:border-[#8B1E3F] pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] hover:from-[#761935] hover:to-[#b63c5c] text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    SEND RESET LINK
                  </button>
                </form>

                <div className="pt-4 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-gray-500 hover:text-gray-900 hover:underline font-bold transition-all inline-flex items-center gap-1"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
