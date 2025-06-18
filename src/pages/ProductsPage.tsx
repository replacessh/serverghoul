import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Paper,
  InputBase,
  Divider,
  Badge,
  Tooltip,
  Drawer,
  useMediaQuery
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { addToCart } from '../store/slices/cartSlice';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const PRODUCTS_STORAGE_KEY = 'admin_products';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  sizes: string[];
  rating: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      setLoading(true);
      setError(null);
      const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleAddToCart = async (product: Product) => {
    if (!token) {
      setError('Для добавления в корзину необходимо авторизоваться');
      return;
    }
    try {
      setError(null);
      dispatch(addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: product.sizes[0] || 'default',
        image: product.imageUrl
      }));
      alert('Товар добавлен в корзину');
    } catch (err) {
      setError('Произошла ошибка при добавлении в корзину');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        const aRating = a.reviews?.reduce((acc, review) => acc + review.rating, 0) / (a.reviews?.length || 1);
        const bRating = b.reviews?.reduce((acc, review) => acc + review.rating, 0) / (b.reviews?.length || 1);
        return bRating - aRating;
      default:
        return 0;
    }
  });

  if (sortOrder === 'asc') {
    sortedProducts.reverse();
  }

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

  // Мобильная версия: фильтры и сортировка в Drawer
  const filterSortDrawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Фильтры и сортировка</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Категория</InputLabel>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          label="Категория"
        >
          <MenuItem value="all">Все категории</MenuItem>
          <MenuItem value="одежда">Одежда</MenuItem>
          <MenuItem value="обувь">Обувь</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Сортировка</InputLabel>
        <Select
          value={sortBy}
          onChange={handleSort}
          label="Сортировка"
        >
          <MenuItem value="newest">Сначала новые</MenuItem>
          <MenuItem value="price_asc">Цена по возрастанию</MenuItem>
          <MenuItem value="price_desc">Цена по убыванию</MenuItem>
          <MenuItem value="rating">По рейтингу</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handleSortOrder}
        startIcon={<SortIcon />}
        sx={{ mb: 2 }}
      >
        Поменять порядок
      </Button>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => setOpenFilterDrawer(false)}
      >
        Применить
      </Button>
    </Box>
  );

  return (
    <Box sx={{ height: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: isMobile ? 2 : 4, 
          mb: isMobile ? 2 : 4,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Paper
              component="form"
              sx={{
                p: isMobile ? '1px 2px' : '2px 4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                boxShadow: 'none',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={handleSearch}
                inputProps={{ 'aria-label': 'search products' }}
              />
              <IconButton type="button" sx={{ p: isMobile ? '6px' : '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            {isMobile ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton color="primary" onClick={() => setOpenFilterDrawer(true)}>
                  <FilterIcon />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    label="Категория"
                  >
                    <MenuItem value="all">Все категории</MenuItem>
                    <MenuItem value="одежда">Одежда</MenuItem>
                    <MenuItem value="обувь">Обувь</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Сортировка</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSort}
                    label="Сортировка"
                  >
                    <MenuItem value="newest">Сначала новые</MenuItem>
                    <MenuItem value="price_asc">Цена по возрастанию</MenuItem>
                    <MenuItem value="price_desc">Цена по убыванию</MenuItem>
                    <MenuItem value="rating">По рейтингу</MenuItem>
                  </Select>
                </FormControl>
                <IconButton onClick={handleSortOrder} color="primary">
                  <SortIcon />
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Drawer для фильтров и сортировки на мобильных */}
      <Drawer
        anchor="right"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        PaperProps={{ sx: { borderRadius: '16px 0 0 16px' } }}
      >
        {filterSortDrawer}
      </Drawer>

      <Grid container spacing={isMobile ? 2 : 4}>
        {sortedProducts.map((product) => (
          <Grid item xs={12} sm={isMobile ? 12 : 6} md={isMobile ? 12 : 4} lg={isMobile ? 12 : 3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: isMobile ? 'none' : 'translateY(-8px)',
                  boxShadow: isMobile ? 'none' : `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}
            >
              <CardMedia
                component="img"
                height={isMobile ? '180' : '280'}
                image={product.imageUrl}
                alt={product.name}
                sx={{
                  objectFit: 'cover',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                <Typography 
                  gutterBottom 
                  variant={isMobile ? 'subtitle1' : 'h6'} 
                  component="div"
                  sx={{ 
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating 
                    value={product.reviews?.length > 0 
                      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
                      : 0
                    } 
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
                  sx={{ 
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    sx={{ 
                      fontWeight: 700,
                      color: 'primary.main'
                    }}
                  >
                    {product.price.toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      fontWeight: 500
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddToCart(product)}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      fontSize: isMobile ? '1rem' : undefined,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }}
                  >
                    В корзину
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/products/${product.id}`)}
                    fullWidth={isMobile}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: isMobile ? undefined : '120px',
                      fontSize: isMobile ? '1rem' : undefined,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    Подробнее
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductsPage; 