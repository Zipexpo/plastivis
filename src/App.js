import React, {Suspense, lazy, useMemo} from 'react'
import Database from "./containers/Database";
import Layout from "./components/Layout";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {themeOptions} from "./config/theme";

// function App({config: appConfig}) {
function App() {
    // const config = {...appConfig}
    // const {components} = config;
    // const {Loading = () => <div/>} = components || {};
    const theme = useMemo(() => createTheme(themeOptions('light')), []);
    return (
        // <Suspense fallback={<Loading/>}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Database>
                    <Layout/>
                </Database>
            </ThemeProvider>
        // </Suspense>
    );
}

export default App;
