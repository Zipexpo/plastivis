export default function (props) {
    const { children, value, index,component:Component, ...other } = props;

    return (
        <Component
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <>
                    {children}
                </>
            )}
        </Component>
    );
}