import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';
import { BackgroundLayer } from './BackgroundLayer';

export const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BackgroundLayer />
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Header />
      </Box>
      <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </Box>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Footer />
      </Box>
    </Box>
  );
};
