import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Support as SupportIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { API_ENDPOINTS } from '../api/config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  sizes: string[];
  createdAt: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const PRODUCTS_STORAGE_KEY = 'admin_products';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Футболка Classic',
    description: 'Классическая хлопковая футболка',
    price: 1999,
    category: 'одежда',
    stock: 10,
    imageUrl: 'https://example.com/tshirt.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Джинсы Slim Fit',
    description: 'Современные джинсы прямого кроя',
    price: 3999,
    category: 'одежда',
    stock: 15,
    imageUrl: 'https://example.com/jeans.jpg',
    sizes: ['M', 'L', 'XL'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Кроссовки Sport',
    description: 'Удобные спортивные кроссовки',
    price: 5999,
    category: 'обувь',
    stock: 8,
    imageUrl: 'https://example.com/sneakers.jpg',
    sizes: ['40', '41', '42', '43'],
    createdAt: new Date().toISOString()
  }
];

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    sizes: []
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Сначала проверяем localStorage
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) {
          try {
            const parsedProducts = JSON.parse(savedProducts);
            setProducts(parsedProducts);
          } catch (err) {
            console.error('Error loading products from localStorage:', err);
          }
        } else {
          // Если в localStorage нет товаров, используем тестовые
          setProducts(DEFAULT_PRODUCTS);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        }

        // Затем загружаем остальные данные с сервера
        const [usersRes, ticketsRes] = await Promise.all([
          api.get(API_ENDPOINTS.admin.users.list),
          api.get('/admin/support/tickets')
        ]);

        console.log('Users response:', usersRes.data);
        console.log('Tickets response:', ticketsRes.data);

        setUsers(usersRes.data);
        setTickets(ticketsRes.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке данных';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Сохранение товаров в localStorage при изменении
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  // Обработчики событий
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await api.post(`/users/ban/${userId}`, { reason: 'Нарушение правил' });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: true } : user
      ));
      enqueueSnackbar('Пользователь заблокирован', { variant: 'success' });
    } catch (err) {
      console.error('Error blocking user:', err);
      enqueueSnackbar('Ошибка при блокировке пользователя', { variant: 'error' });
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await api.post(`/users/unban/${userId}`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: false } : user
      ));
      enqueueSnackbar('Пользователь разблокирован', { variant: 'success' });
    } catch (err) {
      console.error('Error unblocking user:', err);
      enqueueSnackbar('Ошибка при разблокировке пользователя', { variant: 'error' });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    enqueueSnackbar('Товар успешно удален', { variant: 'success' });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.imageUrl) {
      enqueueSnackbar('Заполните все обязательные поля', { variant: 'error' });
      return;
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      category: newProduct.category,
      stock: newProduct.stock || 0,
      imageUrl: newProduct.imageUrl,
      sizes: newProduct.sizes || [],
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: '',
      sizes: []
    });
    setOpenProductDialog(false);
    enqueueSnackbar('Товар успешно добавлен', { variant: 'success' });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    enqueueSnackbar('Товар успешно обновлен', { variant: 'success' });
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      if (newRole === 'ADMIN') {
        await api.post(`/users/make-admin/${userId}`);
      } else {
        await api.post(`/users/make-user/${userId}`);
      }
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      enqueueSnackbar('Роль пользователя обновлена', { variant: 'success' });
    } catch (err) {
      console.error('Error updating user role:', err);
      enqueueSnackbar('Ошибка при обновлении роли пользователя', { variant: 'error' });
    }
  };

  const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      console.log('Updating ticket status:', { ticketId, newStatus });

      // Проверяем подключение к серверу
      try {
        const healthCheck = await api.get('/health');
        console.log('Server health check:', healthCheck.status);
      } catch (err) {
        console.error('Server health check failed:', err);
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }

      // Формируем данные для запроса
      const requestData = {
        status: newStatus
      };
      console.log('Request data:', requestData);

      // Выполняем запрос с подробным логированием
      const response = await api.patch(`/admin/support/tickets/${ticketId}/status`, requestData, {
        timeout: 10000, // Увеличиваем таймаут до 10 секунд
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Явно добавляем токен
        }
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status === 200) {
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
        enqueueSnackbar('Статус тикета обновлен', { 
          variant: 'success',
          autoHideDuration: 3000
        });
      } else {
        console.error('Unexpected response status:', response.status);
        throw new Error('Не удалось обновить статус тикета');
      }
    } catch (err: any) {
      console.error('Detailed error updating ticket status:', {
        error: err,
        response: err.response,
        request: err.request,
        message: err.message
      });
      
      let errorMessage = 'Ошибка при обновлении статуса тикета';
      
      if (err.message === 'Network Error') {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else if (err.response) {
        // Обрабатываем различные коды ошибок
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Некорректные данные';
            break;
          case 401:
            errorMessage = 'Ошибка авторизации. Пожалуйста, войдите снова.';
            break;
          case 403:
            errorMessage = 'У вас нет прав для выполнения этого действия';
            break;
          case 404:
            errorMessage = 'Тикет не найден';
            break;
          case 500:
            errorMessage = 'Ошибка сервера. Попробуйте позже.';
            break;
          default:
            errorMessage = err.response.data?.message || err.message;
        }
      } else if (err.request) {
        errorMessage = 'Сервер не отвечает. Проверьте подключение к серверу.';
      }
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await api.delete(`/admin/support/tickets/${ticketId}`);
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      enqueueSnackbar('Тикет удален', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting ticket:', err);
      enqueueSnackbar('Ошибка при удалении тикета', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -16,
              left: 0,
              width: 60,
              height: 4,
              backgroundColor: 'secondary.main',
              borderRadius: 2
            }
          }}
        >
          Панель администратора
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="admin tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'secondary.main',
                height: 3
              }
            }}
          >
            <Tab 
              icon={<PeopleIcon />} 
              label="Пользователи" 
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                minHeight: 64
              }}
            />
            <Tab 
              icon={<ShoppingCartIcon />} 
              label="Товары" 
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                minHeight: 64
              }}
            />
            <Tab 
              icon={<SupportIcon />} 
              label="Поддержка" 
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                minHeight: 64
              }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...users]
                    .sort((a, b) => {
                      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
                      return 0;
                    })
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            size="small"
                          >
                            <MenuItem value="USER">Пользователь</MenuItem>
                            <MenuItem value="ADMIN">Администратор</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isBlocked ? 'Заблокирован' : 'Активен'}
                            color={user.isBlocked ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.isBlocked ? (
                            <IconButton
                              onClick={() => handleUnblockUser(user.id)}
                              color="success"
                            >
                              <LockOpenIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => handleBlockUser(user.id)}
                              color="error"
                            >
                              <BlockIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenProductDialog(true)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Добавить товар
              </Button>
            </Box>

            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '75%', // 4:3 aspect ratio
                        backgroundColor: theme.palette.grey[100],
                      }}
                    >
                      {product.imageUrl ? (
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.name}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.palette.grey[200],
                          }}
                        >
                          <ShoppingCartIcon sx={{ fontSize: 48, color: theme.palette.grey[400] }} />
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 1,
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mb: 2,
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {product.price.toLocaleString('ru-RU')} ₽
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 16, color: product.stock > 0 ? 'success.main' : 'error.main' }} />
                          {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                        </Typography>
                      </Box>
                      {product.sizes && product.sizes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Доступные размеры:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {product.sizes.map((size) => (
                              <Chip
                                key={size}
                                label={size}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProduct(product.id)}
                          sx={{
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Тема</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.user.name}</TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value)}
                          size="small"
                        >
                          <MenuItem value="pending">Ожидает</MenuItem>
                          <MenuItem value="in_progress">В работе</MenuItem>
                          <MenuItem value="resolved">Решено</MenuItem>
                          <MenuItem value="closed">Закрыто</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
      </Paper>

      <Dialog 
        open={openProductDialog} 
        onClose={() => setOpenProductDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}>
          Добавить новый товар
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Название"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="Описание"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="Цена"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: <Typography sx={{ color: 'text.secondary' }}>₽</Typography>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="Категория"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              fullWidth
              select
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            >
              <MenuItem value="одежда">Одежда</MenuItem>
              <MenuItem value="обувь">Обувь</MenuItem>
            </TextField>
            {newProduct.category && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Выберите размеры
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                }}>
                  {(newProduct.category === 'одежда' ? clothingSizes : shoeSizes).map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      onClick={() => setNewProduct(prev => ({ ...prev, sizes: [...(prev.sizes || []), size] }))}
                      color={newProduct.sizes?.includes(size) ? 'primary' : 'default'}
                      variant={newProduct.sizes?.includes(size) ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              label="Количество"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="URL изображения"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button 
            onClick={() => setOpenProductDialog(false)}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
              }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleAddProduct} 
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px',
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage; 