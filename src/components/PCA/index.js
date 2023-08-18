import {Card, CardContent, Typography, Grid, Box, TextField, MenuItem, Checkbox} from "@mui/material";
import Chart from "./chart";
import {useEffect, useState} from "react";
import {emptyArray, emptyObject} from "../ulti";
import {useData} from "../../providers/DataProvider";

export default function() {
    const {getApi,getValue,setValue,colorBySims} = useData();
    const simsList = getValue("simsList")??[];
    const timestep = getValue('timestep')??0;
    const PCAdata = getValue('PCAdata')??{};
    const [useConnections,setUseConnections] = useState(0);
    const [exclude,setExclude] = useState(false);
    const [PCA,setPCA] = useState(emptyArray);
    useEffect(()=>{
        const key = `${+ (!!useConnections)}${+ (!!exclude)}`
        if (!PCAdata[key]){
            setPCA(emptyArray)
        }else{
            debugger
            setPCA(PCAdata[key])
        }
    },[useConnections,exclude,PCAdata])

    return <Card>
        <Box sx={{ p: 2, pl: 2 }}>
            <CardContent >
                <Grid container justifyContent={"center"} alignContent={"center"} spacing={2}>
                    <Grid item>
                        <div style={{marginTop:15,marginBottom:'auto'}}>PCA plot</div>
                    </Grid>
                    <Grid item>
                        <TextField
                            size={"small"}
                            select
                            value={useConnections} onChange={(event)=>setUseConnections(event.target.value)}>
                            <MenuItem value={0}>By Monitors</MenuItem>
                            <MenuItem value={1}>By Monitors & Connections</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} >
                        <Typography variant={"subtitle2"}
                                    sx={{textAlign:"center"}}
                                    onClick={()=>setExclude(!exclude)}
                        >
                            <Checkbox checked={exclude}/>
                            Exclude first 50k time step
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container sx={{maxWidth:'100%',height:400}}>
                    <Grid item xs={12} >
                        <Chart data={PCA}
                               colorByName={colorBySims}
                               currentTime={timestep}
                               onChangeTime={(t)=> setValue('timestep',t)}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Box>
    </Card>;
}