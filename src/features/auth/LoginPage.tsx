import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { Waves, Mail, Lock, User, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

function ConfirmationScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-2xl mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Revisá tu email
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Te enviamos un enlace de confirmación a:
          </p>
          <p className="font-semibold text-sky-500 mb-6">{email}</p>
          <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-sky-700 dark:text-sky-300 font-medium mb-2">Pasos:</p>
            <ol className="text-sm text-sky-600 dark:text-sky-400 space-y-1 list-decimal list-inside">
              <li>Abrí tu casilla de email</li>
              <li>Buscá el correo de Supabase (revisá spam)</li>
              <li>Hacé clic en el enlace de confirmación</li>
              <li>Volvé acá e iniciá sesión</li>
            </ol>
          </div>
          <Button variant="secondary" onClick={onBack} className="w-full">
            <ArrowLeft size={18} />
            Volver a iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'swimmer' | 'coach'>('swimmer');
  const [error, setError] = useState('');
  const { signIn, signUp, loading, pendingConfirmation, pendingEmail, clearPending } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await signUp(email, password, name, role);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    }
  };

  if (pendingConfirmation && pendingEmail) {
    return (
      <ConfirmationScreen
        email={pendingEmail}
        onBack={() => {
          clearPending();
          setIsRegister(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-4">
            <Waves size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NatacionApp</h1>
          <p className="text-sky-100">Tu plataforma de entrenamiento acuático</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('swimmer')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium ${
                        role === 'swimmer'
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Nadador
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('coach')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium ${
                        role === 'coach'
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Entrenador
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-sky-500 hover:text-sky-600 font-medium"
            >
              {isRegister ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
