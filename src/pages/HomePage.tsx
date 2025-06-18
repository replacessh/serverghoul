import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Rating
} from '@mui/material';
import { RootState } from '../store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SecurityIcon from '@mui/icons-material/Security';
import { setProducts, Product } from '../store/slices/productsSlice';

const PRODUCTS_STORAGE_KEY = 'admin_products';

interface ProductWithRating extends Product {
  averageRating: number;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state: RootState) => state.products);
  const theme = useTheme();

  useEffect(() => {
    const loadProducts = () => {
      try {
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          dispatch(setProducts(parsedProducts));
        }
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };

    loadProducts();
  }, [dispatch]);
  
  // Calculate average rating for each product and sort by rating
  const featuredProducts = [...products]
    .map(product => ({
      ...product,
      averageRating: product.reviews?.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3);

  const features = [
    {
      icon: <ShoppingBagIcon sx={{ fontSize: 40 }} />,
      title: 'Широкий ассортимент',
      description: 'Более 1000 моделей одежды и обуви'
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Быстрая доставка',
      description: 'Доставка по всей России'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: 'Поддержка 24/7',
      description: 'Всегда на связи с клиентами'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Гарантия качества',
      description: 'Только проверенные поставщики'
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 3,
                  background: `linear-gradient(45deg, ${theme.palette.common.white} 30%, ${alpha(theme.palette.secondary.light, 0.9)} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Добро пожаловать в магазин ИП Сафонова Е.А.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/products"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 28px ${alpha(theme.palette.secondary.main, 0.4)}`
                  }
                }}
              >
                Перейти к товарам
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 6,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 4,
              backgroundColor: 'secondary.main',
              borderRadius: 2
            }
          }}
        >
          Популярные товары
        </Typography>
        {featuredProducts.length > 0 ? (
          <Grid container spacing={4}>
            {featuredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="280"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div"
                      sx={{ fontWeight: 600 }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating 
                        value={product.averageRating} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.reviews?.length || 0})
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {product.description}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 2
                      }}
                    >
                      {product.price.toLocaleString('ru-RU')} ₽
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/products/${product.id}`}
                      fullWidth
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Подробнее
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" align="center" color="text.secondary">
            Нет доступных товаров
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default HomePage; 