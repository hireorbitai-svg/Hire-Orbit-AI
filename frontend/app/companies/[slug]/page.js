"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Users, Star, Briefcase, Clock,
  ExternalLink, Search, Loader2, Building2, Sparkles,
  TrendingUp, Globe, AlertCircle
} from "lucide-react";
import Link from "next/link";

const COMPANY_DATA = {
  google: { name: "Google", industry: "Technology", employees: "150,000+", location: "Bangalore, Hyderabad", rating: 4.5, color: "from-blue-500 to-green-500", logo: "G", founded: "1998", website: "google.com", description: "Google LLC is an American multinational technology company focusing on artificial intelligence, online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.", perks: ["Health insurance", "Free meals", "Remote work", "Learning budget", "Stock options"] },
  microsoft: { name: "Microsoft", industry: "Technology", employees: "220,000+", location: "Hyderabad, Noida", rating: 4.4, color: "from-blue-600 to-cyan-500", logo: "M", founded: "1975", website: "microsoft.com", description: "Microsoft Corporation is an American multinational technology corporation which produces software, consumer electronics, personal computers, and related services.", perks: ["Health insurance", "Hybrid work", "Learning stipend", "Stock options", "Paternity leave"] },
  amazon: { name: "Amazon", industry: "E-Commerce & Cloud", employees: "1,500,000+", location: "Bangalore, Hyderabad", rating: 3.9, color: "from-orange-500 to-yellow-500", logo: "A", founded: "1994", website: "amazon.com", description: "Amazon.com, Inc. is an American multinational conglomerate technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.", perks: ["Health insurance", "RSUs", "Career growth", "Relocation support"] },
  flipkart: { name: "Flipkart", industry: "E-Commerce", employees: "50,000+", location: "Bangalore", rating: 4.0, color: "from-yellow-400 to-orange-400", logo: "F", founded: "2007", website: "flipkart.com", description: "Flipkart is an Indian e-commerce company headquartered in Bangalore, Karnataka, India and incorporated in Singapore.", perks: ["Health coverage", "ESOPs", "Flexible hours", "Team outings"] },
  infosys: { name: "Infosys", industry: "IT Services", employees: "350,000+", location: "Pan India", rating: 3.8, color: "from-indigo-600 to-blue-500", logo: "I", founded: "1981", website: "infosys.com", description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.", perks: ["Health insurance", "Training programs", "Global opportunities", "Sabbatical"] },
  tcs: { name: "TCS", industry: "IT Services", employees: "600,000+", location: "Pan India", rating: 3.9, color: "from-purple-600 to-indigo-500", logo: "T", founded: "1968", website: "tcs.com", description: "Tata Consultancy Services is an Indian multinational information technology company. TCS is the second largest Indian company by market capitalisation.", perks: ["Health insurance", "Global postings", "Learning platform", "Work from home"] },
  wipro: { name: "Wipro", industry: "IT Services", employees: "250,000+", location: "Bangalore", rating: 3.7, color: "from-blue-700 to-teal-500", logo: "W", founded: "1945", website: "wipro.com", description: "Wipro Limited is an Indian multinational corporation that provides information technology, consulting, and business process services.", perks: ["Health insurance", "Skill development", "Flexible work", "Performance bonus"] },
  zomato: { name: "Zomato", industry: "Food Tech", employees: "5,000+", location: "Gurgaon", rating: 4.1, color: "from-red-500 to-orange-500", logo: "Z", founded: "2008", website: "zomato.com", description: "Zomato is an Indian multinational restaurant aggregator and food delivery company founded by Deepinder Goyal and Pankaj Chaddah.", perks: ["Free meals", "ESOPs", "Health insurance", "Fun culture"] },
  swiggy: { name: "Swiggy", industry: "Food Tech", employees: "5,000+", location: "Bangalore", rating: 4.0, color: "from-orange-600 to-red-400", logo: "S", founded: "2014", website: "swiggy.com", description: "Swiggy is an Indian online food ordering and delivery platform founded in 2014 and based in Bangalore, Karnataka, India.", perks: ["Free food credits", "ESOPs", "Health insurance", "Gym membership"] },
  razorpay: { name: "Razorpay", industry: "Fintech", employees: "3,000+", location: "Bangalore", rating: 4.5, color: "from-blue-600 to-violet-500", logo: "R", founded: "2014", website: "razorpay.com", description: "Razorpay is an Indian payments solution company that allows businesses to accept, process and disburse payments.", perks: ["ESOPs", "Health coverage", "MacBook", "Learning budget"] },
  paytm: { name: "Paytm", industry: "Fintech", employees: "10,000+", location: "Noida", rating: 3.7, color: "from-sky-500 to-blue-600", logo: "P", founded: "2010", website: "paytm.com", description: "One 97 Communications Limited (Paytm) is an Indian multinational technology company that specializes in digital payments and financial services.", perks: ["ESOPs", "Health insurance", "Fast growth", "Competitive salary"] },
  byjus: { name: "BYJU'S", industry: "EdTech", employees: "50,000+", location: "Bangalore", rating: 3.4, color: "from-violet-600 to-purple-500", logo: "B", founded: "2011", website: "byjus.com", description: "BYJU'S is an Indian multinational educational technology company, founded in 2011 and headquartered in Bangalore, India.", perks: ["Learning stipend", "Health insurance", "Career growth"] },
  ola: { name: "Ola", industry: "Mobility", employees: "10,000+", location: "Bangalore", rating: 3.8, color: "from-yellow-500 to-orange-500", logo: "O", founded: "2010", website: "olacabs.com", description: "Ola, formally known as ANI Technologies, is an Indian multinational ride-sharing company offering services including peer-to-peer ridesharing and ride service hailing.", perks: ["ESOPs", "Health coverage", "Cab credits"] },
  phonepe: { name: "PhonePe", industry: "Fintech", employees: "4,000+", location: "Bangalore", rating: 4.3, color: "from-violet-700 to-purple-600", logo: "P", founded: "2015", website: "phonepe.com", description: "PhonePe is an Indian digital payments and financial services company headquartered in Bangalore, Karnataka, India.", perks: ["ESOPs", "Health benefits", "Flexible hours", "MacBook"] },
  meesho: { name: "Meesho", industry: "E-Commerce", employees: "3,000+", location: "Bangalore", rating: 4.2, color: "from-pink-500 to-rose-500", logo: "M", founded: "2015", website: "meesho.com", description: "Meesho is an Indian social commerce platform that lets individuals and small businesses start online stores.", perks: ["ESOPs", "Fast growth", "Health insurance", "Remote work"] },
  zepto: { name: "Zepto", industry: "Quick Commerce", employees: "2,000+", location: "Mumbai", rating: 4.1, color: "from-violet-500 to-fuchsia-500", logo: "Z", founded: "2021", website: "zeptonow.com", description: "Zepto is an Indian quick-commerce startup that delivers groceries in 10 minutes across major Indian cities.", perks: ["ESOPs", "Health coverage", "Fast-paced culture"] },
  cred: { name: "CRED", industry: "Fintech", employees: "1,500+", location: "Bangalore", rating: 4.4, color: "from-zinc-700 to-zinc-800", logo: "C", founded: "2018", website: "cred.club", description: "CRED is an Indian fintech company that rewards its members for paying credit card bills on time.", perks: ["Top-tier perks", "ESOPs", "MacBook", "Premium culture"] },
  upgrad: { name: "upGrad", industry: "EdTech", employees: "5,000+", location: "Mumbai", rating: 3.9, color: "from-orange-500 to-amber-500", logo: "U", founded: "2015", website: "upgrad.com", description: "upGrad is an Indian online higher education company providing courses in various domains.", perks: ["Free courses", "Health insurance", "Competitive salary"] },
  groww: { name: "Groww", industry: "Fintech", employees: "1,500+", location: "Bangalore", rating: 4.3, color: "from-emerald-600 to-teal-500", logo: "G", founded: "2016", website: "groww.in", description: "Groww is an Indian investment platform that makes investing simple and transparent for millions.", perks: ["ESOPs", "Health coverage", "MacBook", "Work-life balance"] },
  dream11: { name: "Dream11", industry: "Gaming", employees: "1,500+", location: "Mumbai", rating: 4.2, color: "from-sky-600 to-blue-500", logo: "D", founded: "2008", website: "dream11.com", description: "Dream11 is India's largest sports gaming platform with over 180 million users.", perks: ["ESOPs", "Gaming credits", "Health insurance", "Flexible work"] },
};

const TYPE_COLOR = {
  "Full-time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Part-time": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Contract": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Internship": "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function CompanyPage({ params }) {
  const { slug } = use(params);
  const company = COMPANY_DATA[slug];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!company) return;
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/company-jobs?company=${encodeURIComponent(company.name)}&location=India`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError("Could not load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [company]);

  if (!company) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Company not found</p>
          <Link href="/companies" className="text-emerald-400 text-sm mt-2 inline-block hover:underline">← Back to Companies</Link>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-5`} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <Link href="/companies" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Companies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white font-black text-4xl shadow-2xl flex-shrink-0`}
            >
              {company.logo}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-black text-white mb-1">{company.name}</h1>
                  <p className="text-zinc-400">{company.industry} · Founded {company.founded}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400 font-semibold">Live Jobs</span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm mt-4 leading-relaxed max-w-2xl">{company.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-zinc-600" /> {company.employees}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-600" /> {company.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" /> {company.rating} / 5
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Globe className="w-4 h-4 text-zinc-600" /> {company.website}
                </div>
              </div>

              {/* Perks */}
              <div className="flex flex-wrap gap-2 mt-5">
                {company.perks.map((perk) => (
                  <span key={perk} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                    {perk}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Open Positions</h2>
            <p className="text-zinc-500 text-sm mt-1">
              {loading ? "Fetching live jobs from Google..." : `${filteredJobs.length} jobs found`}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all w-64"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-zinc-500 animate-pulse text-sm">Loading live jobs from Google Jobs...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* No Jobs */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No jobs found</p>
            <p className="text-sm mt-1">Try again later or check directly on {company.website}</p>
          </div>
        )}

        {/* Job Cards */}
        {!loading && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-white/15 hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                          {job.title}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${TYPE_COLOR[job.type] || TYPE_COLOR["Full-time"]}`}>
                          {job.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mb-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> {job.salary}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {job.postedAt}
                        </span>
                      </div>

                      {job.description && (
                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{job.description}</p>
                      )}
                    </div>

                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
