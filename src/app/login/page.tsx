'use client';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Eye, EyeOff, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Brand mark */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 6, justifyContent: 'center' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#0A66C2', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
            Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 2, p: 4 }}>
          <Typography variant="h2" sx={{ mb: 0.75 }}>Sign in</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
            Enter your credentials to access the portal.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  )
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
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>
          </form>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Access is invite-only. Contact your administrator to get started.
        </Typography>
      </Box>
    </Box>
  );
}
