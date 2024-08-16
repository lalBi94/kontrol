import { extendTheme } from "@mui/joy";

export const lightTheme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                background: {
                    body: "#ffffff",
                    surface: "#f0f0f0",
                },
                text: {
                    primary: "#000000",
                },
            },
        },
    },
});

export const darkTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                background: {
                    body: "#121212",
                    surface: "#333333",
                },
                text: {
                    primary: "#ffffff",
                },
            },
        },
    },
});
