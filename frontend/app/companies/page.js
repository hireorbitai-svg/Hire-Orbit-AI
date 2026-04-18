"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, Building2, MapPin, Users, TrendingUp, Star,
  ArrowRight, Sparkles, Globe, ChevronRight
} from "lucide-react";
import Link from "next/link";

const COMPANIES = [
  { name: "Google", slug: "google", industry: "Technology", employees: "150,000+", location: "Bangalore, Hyderabad", rating: 4.5, color: "from-blue-500 to-green-500", logo: "G", openRoles: "500+", description: "Build for everyone at the world's most influential tech company." },
  { name: "Microsoft", slug: "microsoft", industry: "Technology", employees: "220,000+", location: "Hyderabad, Noida", rating: 4.4, color: "from-blue-600 to-cyan-500", logo: "M", openRoles: "400+", description: "Empower every person and organization on the planet to achieve more." },
  { name: "Amazon", slug: "amazon", industry: "E-Commerce & Cloud", employees: "1,500,000+", location: "Bangalore, Hyderabad", rating: 3.9, color: "from-orange-500 to-yellow-500", logo: "A", openRoles: "1000+", description: "Pioneer in cloud computing, e-commerce and artificial intelligence." },
  { name: "Flipkart", slug: "flipkart", industry: "E-Commerce", employees: "50,000+", location: "Bangalore", rating: 4.0, color: "from-yellow-400 to-orange-400", logo: "F", openRoles: "300+", description: "India's homegrown e-commerce giant redefining retail." },
  { name: "Infosys", slug: "infosys", industry: "IT Services", employees: "350,000+", location: "Pan India", rating: 3.8, color: "from-indigo-600 to-blue-500", logo: "I", openRoles: "2000+", description: "Global leader in digital services and consulting." },
  { name: "TCS", slug: "tcs", industry: "IT Services", employees: "600,000+", location: "Pan India", rating: 3.9, color: "from-purple-600 to-indigo-500", logo: "T", openRoles: "5000+", description: "India's largest IT services multinational corporation." },
  { name: "Wipro", slug: "wipro", industry: "IT Services", employees: "250,000+", location: "Bangalore", rating: 3.7, color: "from-blue-700 to-teal-500", logo: "W", openRoles: "1500+", description: "Technology company that transforms businesses." },
  { name: "Zomato", slug: "zomato", industry: "Food Tech", employees: "5,000+", location: "Gurgaon", rating: 4.1, color: "from-red-500 to-orange-500", logo: "Z", openRoles: "150+", description: "Delivering better options for a better tomorrow." },
  { name: "Swiggy", slug: "swiggy", industry: "Food Tech", employees: "5,000+", location: "Bangalore", rating: 4.0, color: "from-orange-600 to-red-400", logo: "S", openRoles: "120+", description: "Making food more accessible to everyone, every day." },
  { name: "Razorpay", slug: "razorpay", industry: "Fintech", employees: "3,000+", location: "Bangalore", rating: 4.5, color: "from-blue-600 to-violet-500", logo: "R", openRoles: "80+", description: "Full-stack financial solutions for modern businesses." },
  { name: "Paytm", slug: "paytm", industry: "Fintech", employees: "10,000+", location: "Noida", rating: 3.7, color: "from-sky-500 to-blue-600", logo: "P", openRoles: "200+", description: "Digital payments and financial services platform." },
  { name: "BYJU'S", slug: "byjus", industry: "EdTech", employees: "50,000+", location: "Bangalore", rating: 3.4, color: "from-violet-600 to-purple-500", logo: "B", openRoles: "100+", description: "World's most valuable EdTech company." },
  { name: "Ola", slug: "ola", industry: "Mobility", employees: "10,000+", location: "Bangalore", rating: 3.8, color: "from-yellow-500 to-orange-500", logo: "O", openRoles: "150+", description: "Creating mobility for a billion Indians." },
  { name: "PhonePe", slug: "phonepe", industry: "Fintech", employees: "4,000+", location: "Bangalore", rating: 4.3, color: "from-violet-700 to-purple-600", logo: "P", openRoles: "100+", description: "India's fastest growing digital payments platform." },
  { name: "Meesho", slug: "meesho", industry: "E-Commerce", employees: "3,000+", location: "Bangalore", rating: 4.2, color: "from-pink-500 to-rose-500", logo: "M", openRoles: "80+", description: "Democratizing internet commerce for everyone." },
  { name: "Zepto", slug: "zepto", industry: "Quick Commerce", employees: "2,000+", location: "Mumbai", rating: 4.1, color: "from-violet-500 to-fuchsia-500", logo: "Z", openRoles: "60+", description: "10-minute grocery delivery startup India loves." },
  { name: "CRED", slug: "cred", industry: "Fintech", employees: "1,500+", location: "Bangalore", rating: 4.4, color: "from-zinc-700 to-zinc-800", logo: "C", openRoles: "50+", description: "Rewarding credit card users for responsible payments." },
  { name: "upGrad", slug: "upgrad", industry: "EdTech", employees: "5,000+", location: "Mumbai", rating: 3.9, color: "from-orange-500 to-amber-500", logo: "U", openRoles: "90+", description: "Higher education and skilling platform." },
  { name: "Groww", slug: "groww", industry: "Fintech", employees: "1,500+", location: "Bangalore", rating: 4.3, color: "from-emerald-600 to-teal-500", logo: "G", openRoles: "60+", description: "Simplifying investing for India." },
  { name: "Dream11", slug: "dream11", industry: "Gaming", employees: "1,500+", location: "Mumbai", rating: 4.2, color: "from-sky-600 to-blue-500", logo: "D", openRoles: "40+", description: "India's biggest fantasy sports platform." },
];

const INDUSTRIES = ["All", "Technology", "IT Services", "Fintech", "E-Commerce", "Food Tech", "EdTech", "Mobility", "Gaming", "Quick Commerce"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const router = useRouter();

  const filtered = COMPANIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = selectedIndustry === "All" || c.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Live Job Listings
            </div>
            <h1 className="text-5xl font-black mb-4">
              Explore <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Top Companies</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
              Browse live job openings from India's top companies — powered by Google Jobs
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search companies or industries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Industry Filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedIndustry === ind
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 border border-white/5 hover:border-emerald-500/30 hover:text-emerald-400"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-zinc-500 text-sm">{filtered.length} companies found</p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live from Google Jobs
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((company, i) => (
              <motion.div
                key={company.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Link href={`/companies/${company.slug}`}>
                  <div className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/15 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer h-full">
                    {/* Glow on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    {/* Logo */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg`}>
                      {company.logo}
                    </div>

                    {/* Info */}
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-3">{company.industry}</p>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-2">{company.description}</p>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" />{company.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Users className="w-3 h-3" />{company.employees} employees
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />{company.rating} rating
                      </div>
                    </div>

                    {/* Open Roles */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                        {company.openRoles} open roles
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No companies found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
