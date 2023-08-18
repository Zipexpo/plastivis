import {
    AppBar, Backdrop,
    Box,
    Container,
    LinearProgress,
    Skeleton, Stack,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import ControlPanel from "../ControlPanel";
import VizPanel from "../VizPanel";
import {useData} from "../../providers/DataProvider";


export default function Layout(){
    const {isLoading} = useData();
    const monitorDataLoading = isLoading('monitorData');
    const stimulusaverage = isLoading('stimulusaverage');
    const netDataLoading = isLoading('netData');
    const connectionTimelineLoading = isLoading('connectionTimeline');
    return <Box sx={{background:'#e2e2e2',overflow:'hidden',position:'relative'}} height="100vh" display="flex" flexDirection="column">
        <AppBar title={'SciVis 2023'} position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    PlastiVis - SciVis 2023 v{require('../../../package.json').version} (minimal version)
                </Typography>
            </Toolbar>
        </AppBar>
        {(monitorDataLoading||stimulusaverage||netDataLoading||connectionTimelineLoading)?
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
            >
                <Stack sx={{ width: '50%' }}>
                    <Box>
                        <Box>
                            <Typography variant="body" color="text.secondary">Loading monitor data: {monitorDataLoading?
                                `${Math.round(
                                monitorDataLoading,
                            )}%`:'Done'}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={monitorDataLoading?monitorDataLoading:100} />
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <Typography variant="body" color="text.secondary">Loading connection data: {netDataLoading?
                                `${Math.round(
                                    netDataLoading,
                            )}%`:'Done'}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={netDataLoading?netDataLoading:100} />
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <Typography variant="body" color="text.secondary">Loading no stimulus average data: {stimulusaverage?
                                `${Math.round(
                                stimulusaverage,
                            )}%`:'Done'}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={stimulusaverage?stimulusaverage:100} />
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <Typography variant="body" color="text.secondary">Loading connection timeline: {connectionTimelineLoading?
                                `${Math.round(
                                    connectionTimelineLoading,
                            )}%`:'Done'}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={connectionTimelineLoading?connectionTimelineLoading:100} />
                        </Box>
                    </Box>
                </Stack>
            </Backdrop>
            :<Box flex={1} padding={2} sx={{height: 'calc(100vh - 48px)'}}>
            <Grid container spacing={2} sx={{height: '100%', width: '100%', position: 'relative'}}
                  alignItems={"stretch"}>
                <Grid item xs={3} container spacing={1} alignItems={"stretch"} direction={'column'}
                      sx={{overflowY: 'auto', height: '100%'}}>
                    <ControlPanel/>
                </Grid>
                <Grid item xs={9} container spacing={1} alignItems={"stretch"} direction={'column'}
                      sx={{overflowY: 'auto', height: '100%'}}>
                    <VizPanel/>
                </Grid>
            </Grid>
        </Box>}
    </Box>
}