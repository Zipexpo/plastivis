export function themeOptions(mode) {
    return {
        palette: {
            mode: 'light',
            primary: {
                main: '#44318d',
                light: '#cfc6e4',
                dark: '#33267c',
            },
            secondary: {
                main: '#d83f87',
                dark: '#731553',
                light: '#eebad5',
                contrastText: 'rgba(255,255,255,0.87)',
            },
            info: {
                main: '#559ae0',
            },
        },
        typography: {
            fontSize: 11,
            htmlFontSize: 13,
            h1: {
                fontSize: '2.1rem',
            },
            h2: {
                fontSize: '1.8rem',
            },
            h3: {
                fontSize: '1.5rem',
            },
            h4: {
                fontSize: '1.3rem',
            },
            h5: {
                fontSize: '1.1rem',
            },
            h6: {
                fontSize: '1rem',
            },
        },
        spacing: 2,
        components: {
            MuiList: {
                defaultProps: {
                    dense: true,
                }
            },
            MuiMenuItem: {
                defaultProps: {
                    dense: true,
                }
            },
            MuiTable: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiButton: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiButtonGroup: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiCheckbox: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiFab: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiFormControl: {
                defaultProps: {
                    margin: 'dense',
                    size: 'small',
                }
            },
            MuiFormHelperText: {
                defaultProps: {
                    margin: 'dense',
                }
            },
            MuiIconButton: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiInputBase: {
                defaultProps: {
                    margin: 'dense',
                }
            },
            MuiInputLabel: {
                defaultProps: {
                    margin: 'dense',
                }
            },
            MuiRadio: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiSwitch: {
                defaultProps: {
                    size: 'small',
                }
            },
            MuiTextField: {
                defaultProps: {
                    margin: 'dense',
                    size: 'small',
                }
            },
            MuiTooltip: {
                defaultProps: {
                    arrow: true,
                }
            },
            MuiCardHeader: {
                styleOverrides: {
                    root: {
                        padding: 6,
                        paddingBottom: 3,
                    },
                }
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        padding: 8,
                        '&:last-child':{
                            paddingBottom: 8
                        }
                    },
                }
            },
            MuiToolbar: {
                defaultProps: {
                    variant: 'dense',
                }
            }
        },
        shape: {
            borderRadius: 4,
        }
    }
};