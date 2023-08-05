import { createTheme } from "@mui/material";
import { red } from "@mui/material/colors";
import { esES } from '@mui/material/locale';


export const generalTheme = createTheme({
    palette: {
        primary: {
            main: '#1565C0'
        },
        secondary: {
            main: '#FFFFE0'
        },
        error: {
            main: red.A400
        }

    }
}, esES)

