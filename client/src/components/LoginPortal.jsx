import React, { useState, useRef } from 'react';
import { Mail, Lock, Shield, User, ArrowRight, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import playSound from './AudioService';

export default function LoginPortal({ onLoginSuccess, onClose, API_BASE_URL }) {
  const [role, setRole] = useState('faculty'); // Default role
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const getRoleEmailPlaceholder = () => {
    return role === 'admin' ? 'admin@unismart.edu' : 'sarah.jenkins@unismart.edu';
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email, role });
      setLoading(false);
      playSound('success');

      if (response.data.simulatedOtp) {
        setSimulatedOtp(response.data.simulatedOtp);
      }
      setStep(2);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    } catch (err) {
      setLoading(false);
      playSound('alert');
      setErrorMsg(err.response?.data?.error || 'Failed to dispatch verification code.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp, role });
      setLoading(false);
      playSound('success');
      
      const { token, user } = response.data;
      onLoginSuccess(token, user, role);
    } catch (err) {
      setLoading(false);
      playSound('alert');
      setErrorMsg(err.response?.data?.error || 'Invalid or expired code.');
    }
  };

  const handleOtpChange = (val, idx) => {
    if (isNaN(val)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = val;
    setOtpDigits(newDigits);

    if (val !== '' && idx < 5) {
      inputRefs[idx + 1].current.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && otpDigits[idx] === '' && idx > 0) {
      inputRefs[idx - 1].current.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-bgbase/85 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-panel w-full max-w-[440px] p-8 relative rounded-2xl animate-tab-slide">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 text-textSecondary hover:text-textPrimary transition-colors">
          <X size={20} />
        </button>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primaryIndigo/10 text-primaryIndigo rounded-full mb-4 shadow-[inset_0_0_10px_rgba(99,102,241,0.15)]">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">UniSmart Secure Portal</h2>
          <p className="text-textSecondary text-xs">Select your role to access university dashboards</p>
        </div>

        {/* Role Toggles */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => { setRole('faculty'); setEmail(''); setStep(1); }}
            className={`flex flex-col items-center gap-2 py-3 rounded-xl border font-semibold text-xs transition-all ${
              role === 'faculty' 
                ? 'bg-primaryIndigo/10 border-primaryIndigo text-primaryIndigo shadow-glow' 
                : 'bg-white/2 border-glassBorder text-textSecondary hover:bg-white/5'
            }`}
          >
            <User size={18} />
            <span>Faculty Member</span>
          </button>
          <button
            onClick={() => { setRole('admin'); setEmail(''); setStep(1); }}
            className={`flex flex-col items-center gap-2 py-3 rounded-xl border font-semibold text-xs transition-all ${
              role === 'admin' 
                ? 'bg-primaryIndigo/10 border-primaryIndigo text-primaryIndigo shadow-glow' 
                : 'bg-white/2 border-glassBorder text-textSecondary hover:bg-white/5'
            }`}
          >
            <Shield size={18} />
            <span>Super Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-dangerRedBg border border-dangerRed/20 text-dangerRed px-4 py-2.5 rounded-lg text-xs mb-5 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Send Email */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-textSecondary">University Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getRoleEmailPlaceholder()}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo focus:bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primaryIndigo hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Send OTP Code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            
            {simulatedOtp && (
              <div className="bg-successGreenBg border border-successGreen/20 text-successGreen px-4 py-3 rounded-lg text-xs font-bold text-center animate-pulse-glow">
                [Local Dev OTP] Verification Code: <strong>{simulatedOtp}</strong>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-textSecondary text-center">Enter 6-Digit OTP</label>
              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-12 h-12 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo focus:bg-white/[0.06] rounded-lg text-center text-lg font-bold text-white focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-primaryIndigo hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>Verify & Login</span>}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-textSecondary hover:text-primaryIndigo text-xs underline py-2 transition-colors"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
