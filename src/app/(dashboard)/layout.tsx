'use client';
import { useState, useEffect } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography,
  Divider, IconButton, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Menu, MenuItem, Tooltip, Badge, useTheme, useMediaQuery
} from '@mui/material';
import {
  LayoutDashboard, Send, MessageSquare, Zap, CreditCard,
  Clock, Building2, Users, Settings, LogOut, Menu as MenuIcon,
  Bell, ChevronRight, IdCard, X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

const DRAWER_WIDTH = 240;

const NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Send SMS',      icon: Send,             href: '/send' },
  { label: 'Bulk SMS',      icon: MessageSquare,    href: '/send/bulk' },
  { label: 'Campaigns',     icon: Zap,              href: '/campaigns' },
  { label: 'Sender IDs',    icon: IdCard,           href: '/sender-ids' },
  { label: 'History',       icon: Clock,            href: '/history' },
  { label: 'Top Up',        icon: CreditCard,       href: '/topup' },
];
const ADMIN_NAV = [
  { label: 'Users',         icon: Users,            href: '/users',         roles: ['super_admin','org_admin'] },
  { label: 'Organisations', icon: Building2,        href: '/organisations', roles: ['super_admin'] },
];

function NavItem({ label, icon: Icon, href, active }: { label: string; icon: any; href: string; active: boolean }) {
  return (
    <ListItem disablePadding sx={{ mb: 0.25 }}>
      <ListItemButton
        component={Link}
        href={href}
        className={active ? 'nav-active' : ''}
        sx={{
          borderRadius: 1.5,
          borderLeft: active ? '2px solid #0A66C2' : '2px solid transparent',
          py: 0.875,
          px: 1.25,
          color: active ? '#0A66C2' : 'text.secondary',
          bgcolor: active ? 'rgba(10,102,194,0.06)' : 'transparent',
          '&:hover': { bgcolor: active ? 'rgba(10,102,194,0.06)' : '#F8FAFC', color: active ? '#0A66C2' : 'text.primary' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
          <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
        </ListItemIcon>
        <ListItemText
          primary={label}
          sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: active ? 600 : 500 } }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { user, isLoading, logout, isSuperAdmin, isOrgAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => { 
    if (!isLoading && !user) router.push('/login'); 
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const adminItems = ADMIN_NAV.filter(n => {
    return n.roles.some(role => {
      if (role === 'super_admin') return isSuperAdmin;
      if (role === 'org_admin') return isOrgAdmin;
      return false;
    });
  });

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?';

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, bgcolor: '#0A66C2', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={14} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
            Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: 'text.secondary' }}>
            <X size={16} />
          </IconButton>
        )}
      </Box>
      <Divider />

      {/* Main nav */}
      <Box sx={{ px: 1.5, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {NAV.map(n => <NavItem key={n.href} {...n} active={pathname === n.href} />)}
        </List>

        {adminItems.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ px: 1.25, py: 1.5, fontSize: '0.65rem' }}>
              Admin
            </Typography>
            <List disablePadding>
              {adminItems.map(n => <NavItem key={n.href} {...n} active={pathname === n.href} />)}
            </List>
          </>
        )}
      </Box>

      <Divider />
      {/* User footer */}
      <Box
        sx={{ px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' } }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#0A66C2' }}>{initials}</Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : user?.email}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.2 }}>
            {user?.role?.replace('_', ' ')}
          </Typography>
        </Box>
        <ChevronRight size={14} color="#94A3B8" />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100vw', overflowX: 'hidden', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar — permanent on desktop */}
      {!isMobile && (
        <Box component="nav" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ width: DRAWER_WIDTH, height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            {drawer}
          </Box>
        </Box>
      )}
      {/* Sidebar — drawer on mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', borderRight: '1px solid #E2E8F0' } }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" sx={{ zIndex: 10 }}>
          <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 }, gap: 1 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon size={18} />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={0} color="error" invisible>
                  <Bell size={18} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#0A66C2', cursor: 'pointer', ml: 0.5 }}
            >
              {initials}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 }, width: '100%' }}>
          {children}
        </Box>
      </Box>

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); router.push('/settings'); }} sx={{ gap: 1.5 }}>
          <Settings size={15} /> Settings
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={logout} sx={{ gap: 1.5, color: 'error.main' }}>
          <LogOut size={15} /> Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
