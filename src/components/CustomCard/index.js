import {Box, Card, Typography} from "@mui/material";

const Title = (({children,color='primary',...props}) => (
    <Box sx={(theme)=>({
        width: 'fit-content',
        padding: 2,
        paddingLeft: 6,
        paddingRight: '15%',
        backgroundColor: theme.palette[color].main,
        color: theme.palette[color].contrastText,
    })}>
        <Typography >{children}</Typography>
    </Box>
));
export default function CustomCard({title,toolbar,children,...props}) {
    return <Card sx={{height:'100%', display:'flex',flexDirection:'column'}}>
        <Box sx={{display:'flex',justifyContent:'space-between'}}>
            <Title variant={"h6"} color={'secondary'} paddingLeft={6}>{title}</Title>
            <div style={{paddingRight:6}}>{toolbar}</div>
        </Box>
        {
            children
        }
    </Card>
}