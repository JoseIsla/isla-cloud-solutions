import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, User, Mail, Shield } from 'lucide-react';
import PanelLayout from './PanelLayout';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';

const PanelPerfil = () => {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword }, token);
      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelLayout>
      <StaggerList className="space-y-6 max-w-2xl">
        {/* Profile info */}
        <StaggerItem>
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-foreground text-[15px]">Mi Perfil</h2>
                  <p className="text-muted-foreground text-xs">Información de tu cuenta de administrador</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <User size={11} /> Nombre
                  </span>
                  <p className="font-medium text-foreground text-sm">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={11} /> Email
                  </span>
                  <p className="font-medium text-foreground text-sm">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={11} /> Rol
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Change password */}
        <StaggerItem>
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-foreground text-[15px]">Cambiar Contraseña</h2>
                  <p className="text-muted-foreground text-xs">Introduce tu contraseña actual y la nueva</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="current" className="text-xs font-medium">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="current"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new" className="text-xs font-medium">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs font-medium">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                    size="sm"
                  >
                    {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </StaggerItem>
      </StaggerList>
    </PanelLayout>
  );
};

export default PanelPerfil;
