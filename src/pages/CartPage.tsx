import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Alert,
  CircularProgress
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { removeFromCart, updateQuantity, clearCart, addToCart } from '../store/slices/cartSlice';
import { RootState } from '../store';
import { useAuth } from '../contexts/AuthContext';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CART_STORAGE_KEY = 'local_cart';

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка корзины из localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          dispatch(clearCart());
          cartData.forEach((item: any) => {
            dispatch(addToCart({
              id: item.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              image: item.image
            }));
          });
        }
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
        setError('Ошибка при загрузке корзины');
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [dispatch]);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cartItems]);

  const handleQuantityChange = (id: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      dispatch(updateQuantity({ id, size, quantity: newQuantity }));
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Произошла ошибка при обновлении количества');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = (id: string, size: string) => {
    setItemToDelete({ id, size });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    try {
      setError(null);
      dispatch(removeFromCart(itemToDelete));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Произошла ошибка при удалении товара');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const uniqueCartItems = React.useMemo(() => {
    const seen = new Set();
    return cartItems.filter(item => {
      const key = `${item.id}-${item.size}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [cartItems]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Корзина
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Работа в офлайн-режиме. Изменения сохраняются локально.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {uniqueCartItems.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Корзина пуста
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Перейти к товарам
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {uniqueCartItems.map((item) => (
              <Card key={`${item.id}-${item.size}`} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.name}
                        sx={{ height: 100, objectFit: 'contain' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" component="h2">
                        {item.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Размер: {item.size}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {item.price} ₽
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              handleQuantityChange(item.id, item.size, value);
                            }
                          }}
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center', width: '40px' }
                          }}
                          disabled={isUpdating}
                        />
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRemoveItem(item.id, item.size)}
                          disabled={isUpdating}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Итого
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Товаров:</Typography>
                  <Typography>{totalItems}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Сумма:</Typography>
                  <Typography variant="h6" color="primary">
                    {total} ₽
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/checkout')}
                  disabled={isUpdating}
                >
                  Оформить заказ
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удалить товар?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот товар из корзины?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={confirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage; 