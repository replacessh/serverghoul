import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupportIcon from '@mui/icons-material/Support';
import MenuIcon from '@mui/icons-material/Menu';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isAuthenticated, isAdmin, logout, user, token } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const menuItems = [
    { text: 'Профиль', icon: <PersonIcon />, path: '/profile', auth: true },
    { text: 'Админ-панель', icon: <AdminPanelSettingsIcon />, path: '/admin', auth: true, admin: true },
    { text: 'Поддержка', icon: <SupportIcon />, path: '/support' },
    { text: 'Доступность', icon: <AccessibilityNewIcon />, path: '/accessibility' }
  ];

  const renderMenuItems = () =>
    menuItems
      .filter(item => !item.auth || token)
      .filter(item => !item.admin || (item.admin && user?.role === 'ADMIN'))
      .map(item => (
        <ListItem
          key={item.text}
          onClick={() => {
            navigate(item.path);
            setMobileMenuOpen(false);
          }}
          sx={{
            py: 1.5,
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ));

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: theme.palette.background.paper
        }
      }}
    >
      <List>
        {token ? (
          <>
            <ListItem sx={{ py: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <ListItemText
                primary={user?.name || 'Пользователь'}
                secondary={user?.email}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }}
              />
            </ListItem>
            <Divider />
            {renderMenuItems()}
            <Divider />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.main,
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <ListItemText primary="Выйти" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              sx={{ py: 1.5, '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) } }}
            >
              <ListItemText primary="Войти" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/register');
                setMobileMenuOpen(false);
              }}
              sx={{ py: 1.5, '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) } }}
            >
              <ListItemText primary="Регистрация" />
            </ListItem>
            {renderMenuItems()}
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 700
            }}
          >
            Магазин Сафоновой
          </Typography>

          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button component={RouterLink} to="/products" color="inherit" startIcon={<ShoppingBagIcon />}>
                Товары
              </Button>
              <Button component={RouterLink} to="/support" color="inherit" startIcon={<SupportIcon />}>
                Поддержка
              </Button>
              <Button component={RouterLink} to="/accessibility" color="inherit" startIcon={<AccessibilityNewIcon />}>
                Доступность
              </Button>

              {isAuthenticated ? (
                <>
                  <Button component={RouterLink} to="/cart" color="inherit" startIcon={<ShoppingCartIcon />}>
                    Корзина
                    <Badge badgeContent={cartItemsCount} color="error" sx={{ ml: 1 }} />
                  </Button>
                  <Button component={RouterLink} to="/profile" color="inherit" startIcon={<PersonIcon />}>
                    Профиль
                  </Button>
                  {isAdmin && (
                    <Button component={RouterLink} to="/admin" color="inherit" startIcon={<AdminPanelSettingsIcon />}>
                      Админ
                    </Button>
                  )}
                  <Button onClick={handleLogout} color="inherit" startIcon={<LogoutIcon />}>
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" color="inherit">
                    Войти
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    sx={{ borderColor: 'white', color: 'white' }}
                  >
                    Регистрация
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <IconButton edge="end" color="inherit" onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {renderMobileMenu()}

      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'var(--background-color, rgba(245, 245, 245, 0.5))',
          py: 4
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
