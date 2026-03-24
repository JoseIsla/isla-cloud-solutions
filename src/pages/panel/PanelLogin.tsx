import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import isotipoLogo from '@/assets/logos/isotipo.png';
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
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 p-3">
            <img src={isotipoLogo} alt="Isla Cloud Solutions" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-hero-foreground">Panel de Administración</h1>
          <p className="text-hero-foreground/60 text-sm mt-2">Isla Cloud Solutions</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-card border border-border space-y-5">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="admin@islacloudsolutions.com"
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="••••••••"
              maxLength={128}
            />
          </div>
          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PanelLogin;
