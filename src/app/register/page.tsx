'use client';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress, Grid } from '@mui/material';
import { Eye, EyeOff, Send } from 'lucide-react';
import { authService } from '@/lib/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    organisation_name: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.register(form);
      const { access, refresh, user } = response.data;
      
      // Store tokens and user in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));
      
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data) {
        if (typeof err.response.data === 'string') setError(err.response.data);
        else if (err.response.data.detail) setError(err.response.data.detail);
        else setError(Object.values(err.response.data).flat().join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        {/* Brand mark */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, justifyContent: 'center' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#0A66C2', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
            Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 2, p: 4 }}>
          <Typography variant="h2" sx={{ mb: 0.75 }}>Create an account</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
            Start sending messages in minutes.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    fullWidth
                    required
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    fullWidth
                    required
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Email address"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
              />
              
              <TextField
                label="Phone Number"
                name="phone_number"
                type="tel"
                required
                value={form.phone_number}
                onChange={handleChange}
              />

              <TextField
                label="Company / Organisation Name"
                name="organisation_name"
                required
                value={form.organisation_name}
                onChange={handleChange}
              />

              <TextField
                label="Password"
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 0.5, py: 1.25 }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Sign up'}
              </Button>
            </Box>
          </form>
        </Box>

        <Typography variant="body2" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0A66C2', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
