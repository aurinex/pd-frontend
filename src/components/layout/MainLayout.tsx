import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
