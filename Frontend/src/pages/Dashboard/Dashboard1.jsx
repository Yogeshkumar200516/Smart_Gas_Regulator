import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';

export default function Dashboard() {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    return(
        <Box sx={{minHeight: '100vh',}}>
            <Typography sx={{ 
                fontSize: 24, 
                color: primaryColor,
                textAlign: {xs: 'center', sm: 'left'},
                fontWeight: 'bold', 
                marginTop: 2, }}>
                Dashboard page
            </Typography>
        </Box>
    )
}