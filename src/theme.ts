import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#264653',
      light: '#2a9d8f',
      dark: '#1a2f38',
    },
    secondary: {
      main: '#e76f51',
      light: '#f4a261',
      dark: '#e76f51',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    warning: {
      main: '#e9c46a',
    },
    error: {
      main: '#e76f51',
    },
    success: {
      main: '#2a9d8f',
    },
    info: {
      main: '#264653',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: '#264653',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#264653',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#264653',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#264653',
    },
    h4: {
      fontWeight: 600,
      color: '#264653',
    },
    h5: {
      fontWeight: 600,
      color: '#264653',
    },
    h6: {
      fontWeight: 600,
      color: '#264653',
    },
    button: {
      fontWeight: 500,
    },
  },
});

export default theme; 