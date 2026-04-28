'use client';
import { useState } from 'react';
import {
  Box, Paper, Grid, Typography, TextField, Button,
  Alert, CircularProgress, Divider, Avatar
} from '@mui/material';
import { Save, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { authService } from '@/lib/services/auth';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '';

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg({ type: '', text: '' });
    try {
      await authService.updateMe(profileForm);
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail ?? 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true); setPwMsg({ type: '', text: '' });
    try {
      await authService.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.response?.data?.detail ?? 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your account profile and security preferences." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {/* Profile Section */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#0A66C2', fontSize: '1.75rem', fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.first_name} {user?.last_name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user?.role?.replace('_', ' ')} · {user?.organisation_name ?? 'Dandia SMS'}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 3 }}>
              {profileMsg.text && <Alert severity={profileMsg.type as any} sx={{ mb: 2 }}>{profileMsg.text}</Alert>}
              <form onSubmit={handleProfileUpdate}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 800 }}>
                  <TextField
                    label="Email address"
                    value={user?.email ?? ''}
                    disabled
                    helperText="Email cannot be changed."
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="First name"
                      value={profileForm.first_name}
                      onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                    />
                    <TextField
                      label="Last name"
                      value={profileForm.last_name}
                      onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={profileLoading || (!profileForm.first_name && !profileForm.last_name)}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                    startIcon={profileLoading ? <CircularProgress size={14} color="inherit" /> : <Save size={15} />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </form>
            </Box>
          </Paper>

          {/* Security Section */}
          <Paper>
            <Box sx={{ p: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Lock size={16} /> Security
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>

              {pwMsg.text && <Alert severity={pwMsg.type as any} sx={{ mb: 2 }}>{pwMsg.text}</Alert>}
              
              <form onSubmit={handlePasswordUpdate}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 800 }}>
                  <TextField
                    label="Current password"
                    type="password"
                    required
                    value={pwForm.old_password}
                    onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))}
                  />
                  <TextField
                    label="New password"
                    type="password"
                    required
                    value={pwForm.new_password}
                    onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                  />
                  <TextField
                    label="Confirm new password"
                    type="password"
                    required
                    value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={pwLoading || !pwForm.old_password || !pwForm.new_password || !pwForm.confirm}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                    startIcon={pwLoading ? <CircularProgress size={14} color="inherit" /> : <Save size={15} />}
                  >
                    Update Password
                  </Button>
                </Box>
              </form>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
