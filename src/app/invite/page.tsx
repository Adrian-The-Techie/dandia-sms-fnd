'use client';
import { useState, useEffect, Suspense } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Send } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';

function InviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing invite token.');
  }, [token]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authService.acceptInvite({ token, ...form });
      const { access, refresh, user } = res.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to activate account. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 6, justifyContent: 'center' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#0A66C2', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
            Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 2, p: 4 }}>
          <Typography variant="h2" sx={{ mb: 0.75 }}>Activate your account</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
            Set your name and a password to complete your registration.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField label="First name" required value={form.first_name} onChange={handleChange('first_name')} />
                <TextField label="Last name" value={form.last_name} onChange={handleChange('last_name')} />
              </Box>
              <TextField label="Password" type="password" required value={form.password} onChange={handleChange('password')} />
              <TextField label="Confirm password" type="password" required value={form.confirm} onChange={handleChange('confirm')} />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || !token} sx={{ mt: 0.5, py: 1.25 }}>
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Activate account'}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export default function InvitePage() {
  return <Suspense fallback={null}><InviteForm /></Suspense>;
}
