"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Bell, CreditCard, Shield, Sparkles, LogOut, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    email?: string;
  };
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Plan & Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully logged out");
    router.push("/");
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('user_id', session.user.id);
      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
      }
    }
    setUpdatingProfile(false);
  };

  const handleChangePassword = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email);
      if (error) {
        toast.error("Failed to send reset link");
      } else {
        toast.success("Password reset instructions sent to your email!");
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-black text-white shadow-glow-sm">
                {(name || user?.name || "U").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{name || user?.name || "Professional"}</h3>
                <p className="text-sm text-zinc-400">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  disabled
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                />
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </p>
              </div>
            </div>
            <Button 
              onClick={handleUpdateProfile}
              disabled={updatingProfile}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-glow-sm transition-all py-6 rounded-xl font-bold"
            >
              {updatingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
            {[
              { title: "New Job Matches", desc: "Get notified when AI finds a >80% match" },
              { title: "Weekly Insights", desc: "Receive summary of profile improvements" },
              { title: "Market Alerts", desc: "Updates about hiring trends in your sector" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
                <Switch 
                  defaultChecked={i < 2} 
                  onCheckedChange={(checked) => {
                    toast.success(`${item.title} ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            ))}
          </div>
        );
      case "billing":
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="w-6 h-6 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Pro Pass Active</h3>
              <p className="text-sm text-zinc-400 mb-6">You have unlocked unlimited AI career intelligence and premium matches.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Renews automatically</span>
                <span className="font-bold text-emerald-400">₹249 / month</span>
              </div>
            </div>
            <Button 
              onClick={() => toast.success("Redirecting to billing portal...")}
              variant="outline" 
              className="w-full bg-white/5 border-white/10 text-white py-6 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Manage Subscription
            </Button>
          </div>
        );
      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-sm font-bold text-white mb-1">Update Password</p>
                <p className="text-xs text-zinc-400 mb-4">A strong password helps prevent unauthorized access.</p>
                <Button 
                  onClick={handleChangePassword}
                  variant="outline" 
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all"
                >
                  Change Password
                </Button>
              </div>
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <p className="text-sm font-bold text-red-400 mb-1">Danger Zone</p>
                <p className="text-xs text-zinc-400 mb-4">Permanently delete your account and all data.</p>
                <Button 
                  onClick={() => toast.error("Account deletion requires admin approval in demo mode", { icon: "🔒" })}
                  variant="destructive" 
                  className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl glass-strong rounded-3xl border border-white/10 z-[101] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Settings</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">SaaS Preferences</p>
              </div>
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-auto hidden md:block border-t border-white/5 pt-6">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-10 bg-zinc-950/50 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="max-w-md mt-6 md:mt-0">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
