import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import isotipoLogo from '@/assets/logos/isotipo.png';
import logotipoBlanco from '@/assets/logos/logotipo-blanco-small.png';

const PanelLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Sesión iniciada');
    } catch {
      toast.error('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 p-2.5 backdrop-blur-sm">
            <img src={isotipoLogo} alt="Isla Cloud Solutions" className="w-full h-full object-contain" />
          </div>
          <img src={logotipoBlanco} alt="Isla Cloud Solutions" className="h-6 mx-auto mb-3 opacity-60" />
          <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">Panel de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all text-sm"
              placeholder="admin@islacloudsolutions.com"
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all text-sm"
              placeholder="••••••••"
              maxLength={128}
            />
          </div>
          <Button variant="hero" size="lg" className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <p className="text-white/15 text-[10px] text-center mt-6">
          © {new Date().getFullYear()} Isla Cloud Solutions
        </p>
      </div>
    </div>
  );
};

export default PanelLogin;
