import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import backgroundImage from "../assets/background-hero-section.jpeg";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Panel Izquierdo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Círculos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold">H</span>
          </div>
          <h1 className="text-3xl font-semibold font-heading mb-2">HPVC Admin</h1>
          <p className="text-primary-pale text-sm max-w-xs">
            Panel de administración del Hospital Provincial de Portoviejo Dr. Verdi Cevallos Balda.
          </p>
          <div className="mt-8 text-xs text-primary-pale/70 space-y-1">
            <div>🔒 Acceso restringido a personal autorizado</div>
            <div>🏥 Ministerio de Salud Pública del Ecuador</div>
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Lock size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold font-heading text-neutral-900">
              Iniciar sesión
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Ingresa tus credenciales de administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="admin@hpvc.gob.ec"
                  className="w-full pl-9 pr-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? "Verificando..." : "Ingresar al panel"}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400 mt-6">
            © {new Date().getFullYear()} Hospital Provincial Verdi Cevallos
          </p>
        </div>
      </div>
    </div>
  );
}
