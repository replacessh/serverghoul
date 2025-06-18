import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const PRODUCTS_STORAGE_KEY = 'admin_products';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  category: string;
  stock: number;
  reviews: any[];
  sizes: string[];
  rating: number;
  details: {
    material: string;
    care: string;
    country: string;
  };
}

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newImage, setNewImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [newSize, setNewSize] = useState('');
  const [selectedPredefinedSize, setSelectedPredefinedSize] = useState('');

  const predefinedSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45',
    '46', '47', '48', '49', '50'
  ];

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

        if (!foundProduct.images) {
          foundProduct.images = [foundProduct.imageUrl];
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => prev ? {
      ...prev,
      details: {
        ...prev.details,
        [name]: value
      }
    } : null);
  };

  const handleAddImage = () => {
    if (!newImage.trim()) return;
    
    setProduct(prev => {
      if (!prev) return null;
      
      const images = prev.images || [];
      if (images.includes(newImage.trim())) {
        return prev;
      }
      
      return {
        ...prev,
        images: [...images, newImage.trim()]
      };
    });
    
    setNewImage('');
  };

  const handleRemoveImage = (index: number) => {
    setProduct(prev => {
      if (!prev || !prev.images) return prev;
      
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setProduct(prev => {
      if (!prev || !prev.images) return prev;
      
      return {
        ...prev,
        images: prev.images.map((img, i) => i === index ? e.target.value : img)
      };
    });
  };

  const handleAddSize = () => {
    if (selectedPredefinedSize) {
      setProduct(prev => {
        if (!prev) return null;
        
        const sizes = prev.sizes || [];
        if (sizes.includes(selectedPredefinedSize)) {
          return prev;
        }
        
        return {
          ...prev,
          sizes: [...sizes, selectedPredefinedSize]
        };
      });
      setSelectedPredefinedSize('');
    } else if (newSize.trim()) {
      setProduct(prev => {
        if (!prev) return null;
        
        const sizes = prev.sizes || [];
        if (sizes.includes(newSize.trim())) {
          return prev;
        }
        
        return {
          ...prev,
          sizes: [...sizes, newSize.trim()]
        };
      });
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setProduct(prev => prev ? {
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    } : null);
  };

  const handleSave = () => {
    try {
      const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!savedProducts) {
        throw new Error('Товары не найдены');
      }

      const products = JSON.parse(savedProducts);
      const updatedProducts = products.map((p: Product) => 
        p.id === id ? product : p
      );

      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      setSuccess('Товар успешно обновлен');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Произошла ошибка при сохранении товара');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Загрузка...</Typography>
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
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!product}
        >
          Сохранить
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
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
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={product.name}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={product.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Цена"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Категория"
              name="category"
              value={product.category}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Количество на складе"
              name="stock"
              type="number"
              value={product.stock}
              onChange={handleChange}
            />
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
            <Typography variant="h6" gutterBottom>
              Изображения
            </Typography>
            <Box sx={{ mb: 3 }}>
              {product.images?.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2
                    }}
                  />
                  <TextField
                    fullWidth
                    value={image}
                    onChange={(e) => handleImageChange(e as React.ChangeEvent<HTMLInputElement>, index)}
                    sx={{ mr: 2 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="URL нового изображения"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddImage}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Размеры
            </Typography>
            <Box sx={{ mb: 3 }}>
              {product.sizes?.map((size) => (
                <Chip
                  key={size}
                  label={size}
                  onDelete={() => handleRemoveSize(size)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Выберите размер</InputLabel>
                <Select
                  value={selectedPredefinedSize}
                  onChange={(e) => setSelectedPredefinedSize(e.target.value)}
                  label="Выберите размер"
                >
                  {predefinedSizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddSize}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Или введите свой размер:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Новый размер"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddSize}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Детали товара
            </Typography>
            <TextField
              fullWidth
              label="Материал"
              name="material"
              value={product.details?.material || ''}
              onChange={handleDetailsChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Уход"
              name="care"
              value={product.details?.care || ''}
              onChange={handleDetailsChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Страна производства"
              name="country"
              value={product.details?.country || ''}
              onChange={handleDetailsChange}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminProductEdit;