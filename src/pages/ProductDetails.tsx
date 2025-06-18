import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Rating,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  alpha,
  IconButton,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const PRODUCTS_STORAGE_KEY = 'admin_products';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  category: string;
  stock: number;
  reviews: Review[];
  sizes: string[];
  rating: number;
  details: {
    material: string;
    care: string;
    country: string;
  };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { token, user } = useAuth();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadProduct = () => {
      try {
        setLoading(true);
        setError(null);
        
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (!savedProducts) {
          throw new Error('Товары не найдены');
        }

        const products = JSON.parse(savedProducts);
        const foundProduct = products.find((p: Product) => p.id === id);

        if (!foundProduct) {
          throw new Error('Товар не найден');
        }

        setProduct(foundProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке товара');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSizeChange = (event: SelectChangeEvent) => {
    setSelectedSize(event.target.value);
  };

  const handleAddToCart = () => {
    if (!token) {
      setError('Для добавления в корзину необходимо авторизоваться');
      return;
    }

    if (!product) return;

    if (product.sizes?.length > 0 && !selectedSize) {
      setError('Выберите размер');
      return;
    }

    try {
      dispatch(addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: selectedSize || 'default',
        image: product.imageUrl
      }));

      alert('Товар добавлен в корзину');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Произошла ошибка при добавлении в корзину');
    }
  };

  const handleShareClick = () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .catch((error) => {
          console.error('Ошибка при попытке поделиться:', error);
        });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Ссылка скопирована в буфер обмена');
        })
        .catch((error) => {
          console.error('Ошибка при копировании:', error);
        });
    }
  };

  const handleEditClick = () => {
    navigate(`/admin/products/${id}/edit`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Для добавления отзыва необходимо авторизоваться');
      return;
    }

    try {
      setSubmittingReview(true);
      if (product) {
        const newReview = {
          id: Date.now().toString(),
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          createdAt: new Date().toISOString(),
          author: {
            id: user?.id || '',
            name: user?.name || 'Аноним'
          }
        };

        const updatedProduct = {
          ...product,
          reviews: [...(product.reviews || []), newReview]
        };

        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          const updatedProducts = products.map((p: Product) => 
            p.id === product.id ? updatedProduct : p
          );
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
          setProduct(updatedProduct);
        }

        setReviewForm({
          rating: 5,
          comment: ''
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Произошла ошибка при добавлении отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    if (newValue !== null) {
      setReviewForm(prev => ({
        ...prev,
        rating: newValue
      }));
    }
  };

  const handleNextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
      setIsZoomed(false);
    }
  };

  const handlePrevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

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

  if (!product) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Товар не найден
        </Alert>
      </Container>
    );
  }

  const averageRating = product.reviews?.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const images = product.images || [product.imageUrl];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          Назад
        </Button>
        {user?.role === 'ADMIN' && (
          <Button
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            variant="outlined"
            color="primary"
          >
            Редактировать
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
            >
              <Box
                component="img"
                src={images[selectedImage]}
                alt={product.name}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                sx={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  transform: isZoomed ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  '&:hover': {
                    transform: isZoomed ? 'scale(2)' : 'scale(1.02)'
                  }
                }}
              />
              {!isZoomed && (
                <>
                  <IconButton
                    onClick={handleImageClick}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      bottom: 16,
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.9)
                      }
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.9)
                      }
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.9)
                      }
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {images.length > 1 && (
              <>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1
                }}>
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: selectedImage === index 
                          ? theme.palette.primary.main 
                          : alpha(theme.palette.primary.main, 0.3),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                      onClick={() => {
                        setSelectedImage(index);
                        setIsZoomed(false);
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            {images.length > 1 && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                p: 2,
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '2px'
                }
              }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    onClick={() => {
                      setSelectedImage(index);
                      setIsZoomed(false);
                    }}
                    sx={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : 'none',
                      opacity: selectedImage === index ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              <IconButton
                onClick={handleShareClick}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                {product.price.toLocaleString('ru-RU')} ₽
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {product.reviews?.length || 0} отзывов
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
              {product.description}
            </Typography>

            {product.details && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Детали товара
                </Typography>
                <Grid container spacing={2}>
                  {product.details.material && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Материал
                      </Typography>
                      <Typography variant="body1">
                        {product.details.material}
                      </Typography>
                    </Grid>
                  )}
                  {product.details.care && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Уход
                      </Typography>
                      <Typography variant="body1">
                        {product.details.care}
                      </Typography>
                    </Grid>
                  )}
                  {product.details.country && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Страна производства
                      </Typography>
                      <Typography variant="body1">
                        {product.details.country}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {product.sizes?.length > 0 && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Размер</InputLabel>
                <Select
                  value={selectedSize}
                  onChange={handleSizeChange}
                  label="Размер"
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1.5
                    }
                  }}
                >
                  {product.sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              В корзину
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Отзывы */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы
        </Typography>

        {user && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Оставить отзыв
            </Typography>
            <form onSubmit={handleReviewSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Оценка</Typography>
                <Rating
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleRatingChange}
                />
              </Box>
              <TextField
                fullWidth
                label="Ваш отзыв"
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submittingReview}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
            </form>
          </Paper>
        )}

        {product.reviews?.length > 0 ? (
          product.reviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              sx={{
                p: 4,
                mb: 2,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {review.author.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {review.author.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body1">
                {review.comment}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            Пока нет отзывов. Будьте первым, кто оставит отзыв!
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetails; 