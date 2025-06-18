import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { useAccessibility } from '../contexts/AccessibilityContext';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ContrastIcon from '@mui/icons-material/Contrast';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import AnimationIcon from '@mui/icons-material/Animation';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import LinkIcon from '@mui/icons-material/Link';

const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const theme = useTheme();

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.8)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccessibilityNewIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h5" component="h2">
          Настройки доступности
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FormatSizeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1">Размер шрифта</Typography>
          </Box>
          <Slider
            value={settings.fontSize}
            onChange={(_, value) => updateSettings({ fontSize: value as number })}
            min={1}
            max={2}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
          />
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ContrastIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1">Цветовая схема</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              />
            }
            label="Высокая контрастность"
          />
          <Select
            value={settings.colorScheme}
            onChange={(e) => updateSettings({ colorScheme: e.target.value as any })}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="default">Стандартная</MenuItem>
            <MenuItem value="blue-yellow">Сине-желтая</MenuItem>
            <MenuItem value="black-white">Черно-белая</MenuItem>
          </Select>
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextFormatIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1">Шрифт и стили</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings.readableFont}
                onChange={(e) => updateSettings({ readableFont: e.target.checked })}
              />
            }
            label="Читаемый шрифт"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.disableStyles}
                onChange={(e) => updateSettings({ disableStyles: e.target.checked })}
              />
            }
            label="Отключить стили"
          />
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FormatLineSpacingIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1">Интервалы</Typography>
          </Box>
          <Typography variant="body2" gutterBottom>Межстрочный интервал</Typography>
          <Slider
            value={settings.lineSpacing}
            onChange={(_, value) => updateSettings({ lineSpacing: value as number })}
            min={1}
            max={2}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
          />
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>Межбуквенный интервал</Typography>
          <Slider
            value={settings.letterSpacing}
            onChange={(_, value) => updateSettings({ letterSpacing: value as number })}
            min={0}
            max={5}
            step={0.5}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}px`}
          />
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LinkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1">Дополнительно</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings.underlineLinks}
                onChange={(e) => updateSettings({ underlineLinks: e.target.checked })}
              />
            }
            label="Подчеркивать ссылки"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.reduceMotion}
                onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
              />
            }
            label="Отключить анимацию"
          />
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<RestartAltIcon />}
          onClick={resetSettings}
          sx={{ mt: 2 }}
        >
          Сбросить настройки
        </Button>
      </Box>
    </Paper>
  );
};

export default AccessibilitySettings; 