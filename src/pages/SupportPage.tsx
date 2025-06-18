import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

const SupportPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/support', {
        title: formData.title,
        description: formData.description,
        userId: user?.id
      });

      enqueueSnackbar('Тикет успешно создан', { variant: 'success' });
      setFormData({ title: '', description: '' });
      await fetchTickets();
    } catch (err: any) {
      console.error('Error creating support ticket:', err);
      setError(err.response?.data?.message || 'Ошибка при создании тикета');
      enqueueSnackbar('Ошибка при создании тикета', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get('/support/tickets');
      setTickets(response.data);
    } catch (err: any) {
      console.error('Error fetching support tickets:', err);
      enqueueSnackbar('Ошибка при получении тикетов', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Служба поддержки
        </Typography>
        <Typography variant="body1" paragraph>
          Если у вас возникли вопросы или проблемы, пожалуйста, заполните форму ниже.
          Наша команда поддержки свяжется с вами в ближайшее время.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Тема"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Описание проблемы"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            required
            multiline
            rows={4}
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Отправить'}
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2 }}>
          Ваши тикеты
        </Typography>
        {tickets.map((ticket) => (
          <Card key={ticket.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {ticket.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {ticket.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Статус: {ticket.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Создан: {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Paper>
    </Container>
  );
};

export default SupportPage; 