import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
} from '@mui/material';
import { RootState } from '../store';
import { removeFromFavorites } from '../store/slices/favoritesSlice';
import { Product } from '../store/slices/productsSlice';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state: RootState) => state.favorites.items);
  const products = useSelector((state: RootState) => state.products.items);
  
  const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));

  if (favoriteProducts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          У вас пока нет избранных товаров
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
          >
            Перейти к товарам
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Избранные товары
      </Typography>
      <Grid container spacing={3}>
        {favoriteProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {product.price.toLocaleString('ru-RU')} ₽
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    Подробнее
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => dispatch(removeFromFavorites(product.id))}
                  >
                    Удалить
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage; 