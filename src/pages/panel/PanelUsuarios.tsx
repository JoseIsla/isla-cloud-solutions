import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, UserCog, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';

interface UserFromAPI {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const PanelUsuarios = () => {
  const { token, user: currentUser } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [users, setUsers] = useState<UserFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<UserFromAPI> & { password?: string } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filter, setFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    if (!token) return;
    usersApi.list(token).then(setUsers).catch(() => toast.error('Error cargando usuarios'));
  };
  useEffect(load, [token]);

  const filtered = users.filter(u =>
    !filter ||
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSave = async () => {
    if (!token || !editing) return;
    if (!editing.name?.trim() || !editing.email?.trim()) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    if (isNew && (!editing.password || editing.password.length < 8)) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      if (isNew) {
        await usersApi.create(editing, token);
        toast.success('Usuario creado');
      } else {
        await usersApi.update(editing.id!, editing, token);
        toast.success('Usuario actualizado');
      }
      setEditing(null);
      setShowPassword(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    if (!(await confirm('¿Eliminar este usuario?', 'Esta acción no se puede deshacer.'))) return;
    try {
      await usersApi.delete(id, token);
      toast.success('Usuario eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Usuarios</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{users.length} administradores</p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ name: '', email: '', password: '', role: 'admin' }); setIsNew(true); setShowPassword(false); }}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Modal */}
        {editing && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 min-h-screen">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{isNew ? 'Nuevo usuario' : 'Editar usuario'}</h3>
                <button onClick={() => { setEditing(null); setShowPassword(false); }} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={editing.name ?? ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editing.email ?? ''}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {isNew ? 'Contraseña' : 'Nueva contraseña (dejar vacía para no cambiar)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editing.password ?? ''}
                      onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                      placeholder={isNew ? 'Mínimo 8 caracteres' : 'Sin cambios'}
                      className="w-full px-3 py-2.5 pr-10 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave}>Guardar</Button>
                  <Button variant="outline" onClick={() => { setEditing(null); setShowPassword(false); }}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        , document.body)}

        {/* List */}
        <StaggerList className="space-y-1">
          {filtered.map((u) => (
            <StaggerItem
              key={u.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/15 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserCog size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block truncate">{u.name}</span>
                <span className="text-xs text-muted-foreground truncate block">{u.email}</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full shrink-0">
                {u.role}
              </span>
              {u.id === currentUser?.id && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">Tú</span>
              )}
              <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing({ ...u, password: '' }); setIsNew(false); setShowPassword(false); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary">
                  <Pencil size={13} />
                </button>
                {u.id !== currentUser?.id && (
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </StaggerItem>
          ))}
          {users.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay usuarios registrados
            </div>
          )}
        </StaggerList>
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelUsuarios;
