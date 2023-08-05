import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react'
import { generalTheme } from './';

export const AppTheme = ({ children }) => {
    return (
    <ThemeProvider theme={ generalTheme }>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        { children }
    </ThemeProvider>
    )
}
