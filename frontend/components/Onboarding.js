"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileCheck, Loader2, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

// 🛠️ HELPER: ROBUST UPLOAD AND ANALYSIS TRIGGER
const handleResumeUpload = async (supabase, file, userId, token, setUploading, setSuccess, setUploadedUrl, router) => {
  if (!file) {
    toast.error("Please select a resume file (.pdf)");
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);
    formData.append("jobDescription", "Unknown");

    // ✅ Use Next.js API proxy to avoid CORS — server-side forwards to backend
    const response = await fetch(`/api/upload-resume`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    toast.success("Resume analyzed and profile updated! 🚀");
    setSuccess(true);
    setUploadedUrl(data.resume_url || data.resumeData?.resume_url || "");
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    toast.error(err.message || "Failed to analyze resume");
  } finally {
    setUploading(false);
  }
};

export default function Onboarding() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session → redirecting once");
          router.replace("/login");
        } else {
          setUserId(session.user.id);
          setToken(session.access_token);

          // Check if user already has a resume
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          const hasUploadedResume =
            profileData?.resume_url ||
            (profileData?.skills && profileData?.skills.length > 0) ||
            (profileData?.role && profileData?.role !== "Unknown");

          if (hasUploadedResume) {
            console.log("🚀 Resume already Found → Redirecting to Dashboard");
            router.replace("/dashboard");
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/login");
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSubmit = () => {
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }
    handleResumeUpload(supabase, file, userId, token, setUploading, setSuccess, setUploadedUrl, router);
  };


  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl relative"
      >
        {/* Decorative Badge */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Career Launchpad
          </motion.div>
        </div>

        <div className="glass-strong rounded-[2.5rem] p-10 lg:p-12 border border-white/10 relative overflow-hidden group shadow-2xl">
          {/* Internal Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />
          
          <div className="text-center mb-12 relative">
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Upload Your <span className="gradient-text">Future</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-sm mx-auto">
              Our AI will analyze your resume to find perfect matches and career growth opportunities.
            </p>
          </div>

          <div className="space-y-8 relative">
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: 'rgba(16, 185, 129, 0.3)' }}
              whileTap={{ scale: 0.99 }}
              className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500 text-center cursor-pointer group/upload ${
                file 
                  ? 'border-emerald-500/50 bg-emerald-500/5 ring-8 ring-emerald-500/5' 
                  : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5 bg-zinc-950/30'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <div className="p-5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                        <FileCheck className="w-12 h-12 text-emerald-400" />
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-500 blur-2xl rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-emerald-400 text-xl font-bold px-4 line-clamp-1">
                        {file.name}
                      </p>
                      <p className="text-sm text-emerald-500/60 font-medium">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Orbit Analysis
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group-hover/upload:bg-emerald-500/10 group-hover/upload:border-emerald-500/20 transition-all duration-300">
                      <CloudUpload className="w-12 h-12 text-zinc-500 group-hover/upload:text-emerald-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-300 text-xl font-medium">
                        Drop your resume or <span className="text-emerald-400 font-bold">browse</span>
                      </p>
                      <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest">PDF format only • Max 5MB</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="space-y-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={uploading || success || !file}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 ${
                  success 
                    ? 'bg-emerald-500 text-white shadow-glow' 
                    : !file
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-glow hover:shadow-glow-lg'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="tracking-widest uppercase">Initializing AI Engines...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    ANALYSIS COMPLETE
                  </>
                ) : (
                  <>
                    START ANALYSIS
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {success && uploadedUrl && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-6 mt-6 border-t border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Secure Orbit Link</p>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Live</span>
                      </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center justify-between gap-4 group/url hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-white/5 rounded-xl">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate font-mono max-w-[200px]">
                          {uploadedUrl}
                        </p>
                      </div>
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={uploadedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white/10 hover:bg-emerald-500 hover:text-white text-zinc-300 px-5 py-2.5 rounded-xl transition-all font-black uppercase tracking-widest border border-white/10"
                      >
                        View
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                <span className="flex items-center gap-2 decoration-emerald-500/50 underline underline-offset-4"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> AES-256</span>
                <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                <span className="flex items-center gap-2 decoration-emerald-500/50 underline underline-offset-4"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SUPABASE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Trust Badge */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-zinc-500 text-xs font-medium"
        >
          Trusted by over <span className="text-white">10,000+</span> professionals worldwide.
        </motion.p>
      </motion.div>
    </div>
  );
}
