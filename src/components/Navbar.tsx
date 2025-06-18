import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Container
} from '@mui/material';
import { Support as SupportIcon, ShoppingCart, Menu } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Кнопки, которые должны отображаться всегда
  const commonButtons = [
    { text: 'Товары', path: '/products' },
    { text: 'Поддержка', path: '/support', icon: <SupportIcon /> }
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Магазин Сафоновой
          </Typography>

          {/* Десктопное меню */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {commonButtons.map((button) => (
              <Button
                key={button.path}
                color="inherit"
                component={RouterLink}
                to={button.path}
                startIcon={button.icon}
              >
                {button.text}
              </Button>
            ))}

            {isAuthenticated && (
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/cart"
                size="large"
              >
                <Badge badgeContent={cartItemsCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}
          </Box>

          {/* Мобильное меню - только иконка поддержки */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/support"
              size="large"
            >
              <SupportIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;