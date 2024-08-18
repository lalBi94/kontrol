import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";
import { lightTheme, darkTheme } from "../../theme";
import { CssBaseline, CssVarsProvider } from "@mui/joy";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("light");

    const toggleTheme = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("theme", newMode);
    };

    const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

    return (
        <ThemeContext.Provider value={value}>
            <CssVarsProvider theme={mode === "light" ? lightTheme : darkTheme}>
                <CssBaseline />
                {children}
            </CssVarsProvider>
        </ThemeContext.Provider>
    );
};
