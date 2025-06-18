import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Alert,
  Paper,
  Rating,
  Avatar,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import BlockIcon from '@mui/icons-material/Block';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

interface Review {
  id: string;
  text: string;
  rating: number;
  user: {
    id: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
  createdAt: string;
}

const Reviews: React.FC<{ productId: string }> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const { token, isAdmin, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  useEffect(() => {
    console.log('Reviews component mounted');
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);
    console.log('User role:', user?.role);
    console.log('Token:', token);
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      console.log('Fetched reviews:', response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      enqueueSnackbar('Необходимо авторизоваться для оставления отзыва', { variant: 'warning' });
      return;
    }

    try {
      await api.post(`/products/${productId}/reviews`, { text: newReview, rating });
      setNewReview('');
      setRating(5);
      fetchReviews();
      enqueueSnackbar('Отзыв успешно добавлен', { variant: 'success' });
    } catch (error) {
      console.error('Error submitting review:', error);
      enqueueSnackbar('Ошибка при добавлении отзыва', { variant: 'error' });
    }
  };

  const handleBanUser = (userId: string, username: string) => {
    console.log('Ban button clicked for user:', username);
    console.log('Current isAdmin state:', isAdmin);
    console.log('Current user role:', user?.role);
    
    if (!isAdmin || user?.role !== 'ADMIN') {
      console.log('User is not admin, cannot ban');
      enqueueSnackbar('У вас нет прав для бана пользователей', { variant: 'error' });
      return;
    }
    
    setSelectedUser({ id: userId, name: username });
    setBanDialogOpen(true);
  };

  const confirmBan = async () => {
    if (!selectedUser || !token) return;

    try {
      await api.post(`/users/ban/${selectedUser.id}`, { reason: banReason });
      enqueueSnackbar(`Пользователь ${selectedUser.name} забанен`, { variant: 'success' });
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
      fetchReviews();
    } catch (error) {
      console.error('Error banning user:', error);
      enqueueSnackbar('Ошибка при бане пользователя', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Отзывы
      </Typography>

      {reviews.map((review) => (
        <Paper
          key={review.id}
          elevation={2}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                {review.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {review.user.name}
                  {review.user.role === 'ADMIN' && (
                    <Typography
                      component="span"
                      sx={{ ml: 1, color: theme.palette.primary.main, fontWeight: 'bold' }}
                    >
                      (Админ)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            {user?.role === 'ADMIN' && review.user.role !== 'ADMIN' && (
              <Tooltip title="Забанить пользователя">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleBanUser(review.user.id, review.user.name)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.error.light,
                      color: theme.palette.error.contrastText
                    }
                  }}
                >
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mt: 1 }}>
            <Rating value={review.rating} readOnly precision={0.5} />
            <Typography variant="body1" sx={{ mt: 1 }}>
              {review.text}
            </Typography>
          </Box>
        </Paper>
      ))}

      <Dialog 
        open={banDialogOpen} 
        onClose={() => setBanDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Забанить пользователя
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Вы собираетесь забанить пользователя {selectedUser?.name}
          </Typography>
          <TextField
            fullWidth
            label="Причина бана"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={confirmBan} 
            color="error" 
            variant="contained"
            disabled={!banReason.trim()}
          >
            Забанить
          </Button>
        </DialogActions>
      </Dialog>

      {token && (
        <Paper 
          component="form" 
          onSubmit={handleSubmitReview} 
          sx={{ 
            mt: 3, 
            p: 3,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
            Оставить отзыв
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Напишите ваш отзыв..."
            margin="normal"
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography component="span" sx={{ mr: 1 }}>
              Оценка:
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  setRating(newValue);
                }
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newReview.trim()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Отправить отзыв
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Reviews; 