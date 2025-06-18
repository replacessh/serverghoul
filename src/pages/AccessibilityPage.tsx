import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Slider,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Contrast,
  TextFields,
  RestartAlt
} from '@mui/icons-material';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityPage: React.FC = () => {
  const theme = useTheme();
  const { settings, updateSettings, resetSettings } = useAccessibility();

  const settingCards = [
    {
      title: 'Контрастность',
      description: 'Включите высокую контрастность для лучшей читаемости',
      icon: <Contrast sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      control: (
        <Switch
          checked={settings.highContrast}
          onChange={(e) => updateSettings({ highContrast: e.target.checked })}
          color="primary"
        />
      )
    },
    {
      title: 'Размер текста',
      description: 'Настройте размер текста для комфортного чтения',
      icon: <TextFields sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      control: (
        <Slider
          value={settings.fontSize}
          onChange={(_, value) => updateSettings({ fontSize: value as number })}
          min={0.5}
          max={2}
          step={0.1}
          marks
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
          sx={{ width: 200 }}
        />
      )
    }
  ];

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      py: 4,
      backgroundColor: alpha(theme.palette.background.default, 0.5)
    }}>
      <Container maxWidth="lg">
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
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 4,
                  backgroundColor: 'secondary.main',
                  borderRadius: 2
                }
              }}
            >
              Настройки доступности
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Настройте параметры доступности для комфортного использования сайта
            </Typography>
          </Box>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={resetSettings}
              sx={{
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Сбросить настройки
            </Button>
          </Box>

          <Grid container spacing={3}>
            {settingCards.map((card, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {card.icon}
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ ml: 2, fontWeight: 600 }}
                      >
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {card.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      {card.control}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Настройки сохраняются автоматически и применяются ко всему сайту
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccessibilityPage; 