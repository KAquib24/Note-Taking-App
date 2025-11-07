import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      
      // 🐐 GOAT LEVEL SUCCESS REDIRECT
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
    } catch (error: any) {
      alert(error.response?.data?.message || "🚫 Registration failed - GOATs only");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-6">
      
      {/* 🎨 GOAT LEVEL REGISTER CARD */}
      <div className="relative w-full max-w-lg">
        
        {/* ✨ ANIMATED BACKGROUND */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
        
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 w-full transform hover:scale-[1.02] transition-all duration-500"
        >
          
          {/* 🐐 GOAT LEVEL HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🌟</span>
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                JOIN THE GOATS
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Legacy</h2>
            <p className="text-gray-300 text-sm">Start your masterpiece collection today</p>
          </div>

          {/* 👑 GOAT LEVEL NAME INPUT */}
          <div className="mb-5">
            <label className="block text-white/80 text-sm font-semibold mb-3">
              👑 Your GOAT Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your legendary name"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          {/* 📧 GOAT LEVEL EMAIL INPUT */}
          <div className="mb-5">
            <label className="block text-white/80 text-sm font-semibold mb-3">
              📧 GOAT Email
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@goat.domain"
              type="email"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          {/* 🔐 GOAT LEVEL PASSWORD INPUT */}
          <div className="mb-8">
            <label className="block text-white/80 text-sm font-semibold mb-3">
              🔐 Secret GOAT Code
            </label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create your master password"
              type="password"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
            <p className="text-gray-400 text-xs mt-2">
              Must contain at least 8 characters of pure GOAT power
            </p>
          </div>

          {/* 🚀 GOAT LEVEL REGISTER BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mb-6"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>INITIATING GOAT PROTOCOL...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>BECOME A GOAT</span>
              </>
            )}
          </button>

          {/* 🔗 GOAT LEVEL FOOTER */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already part of the herd?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors duration-300"
              >
                Access Your Vault
              </button>
            </p>
          </div>
        </form>

        {/* 💫 GOAT LEVEL FEATURES */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-white text-sm font-semibold">Secure</p>
            <p className="text-gray-400 text-xs">GOAT-level encryption</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-white text-sm font-semibold">Fast</p>
            <p className="text-gray-400 text-xs">Lightning quick</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-white text-sm font-semibold">Beautiful</p>
            <p className="text-gray-400 text-xs">Masterpiece UI</p>
          </div>
        </div>

        {/* 🛡️ GOAT LEVEL SECURITY BADGE */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <span className="text-gray-400 text-xs flex items-center gap-2">
              <span>🛡️</span>
              ELITE GOAT MEMBERSHIP
            </span>
          </div>
        </div>
      </div>

      {/* 🎨 GOAT LEVEL STYLES */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;