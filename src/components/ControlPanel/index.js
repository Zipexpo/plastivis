import {
    Box,
    Card,
    CardContent,
    Checkbox,
    Divider, FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel, MenuItem, OutlinedInput, Select, Slider,
    TextField,
    Typography
} from "@mui/material";
import {useData} from "../../providers/DataProvider";
import {useCallback} from "react";
import {emptyArray, emptyObject, monitormap} from "../ulti";
import SelectCheck from "../SelectCheck";
import PCA from "../PCA";

export const staticsTypes = [
    "avg",
    "min",
    "max",
    "var",
    "std_dev",
]

export default function(){
    const {setValue,getValue} = useData();
    const timestep = getValue('timestep')??0;
    const setting3D = getValue('setting3D')??emptyObject;
    const settingTimeline = getValue('settingTimeline')??emptyObject;
    const metricList = getValue('metricList')??emptyArray;
    const simsList = getValue('simsList')??emptyArray;
    const sims = getValue('sims')??emptyArray;

    const handleChange = ((path,value)=>{
        setValue(path,value)
    });

    const handleChangeSetting3D = useCallback((path,value)=>{
        setValue('setting3D',{...setting3D,[path]:value})
    },[setting3D])

    const handleChangeSettingTimeline = useCallback((path,value)=>{
        setValue('settingTimeline',{...settingTimeline,[path]:value})
    },[settingTimeline])
    return <Card sx={{height: '100%',width:'100%', display: 'flex', flexDirection: 'column',overflowY:'auto'}}>
        <CardContent>
            <PCA/>
        </CardContent>
        <CardContent>
            <Typography>3D chart</Typography>
            <SelectCheck
                title={"Sims"}
                value={sims}
                onChange={(event)=>handleChange('sims', event.target.value??emptyArray)}
                renderValue={(selected) => selected.join(', ')}
                options={simsList}/>
            <FormGroup>
                <FormControl>
                    <TextField
                        label={"3D color by Monitor"}
                        select
                        value={setting3D.metric}
                        onChange={(event)=>handleChangeSetting3D('metric', event.target.value)}
                    >
                        {metricList.map((option) => (
                            <MenuItem key={option} value={option}>
                                {monitormap[option]}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
                {/*<FormControlLabel control={<Checkbox*/}
                {/*    checked={setting3D.showNeuron}*/}
                {/*    onChange={(event) => handleChangeSetting3D('showNeuron', event.target.checked)}*/}
                {/*/>} label="Show neurons"/>*/}
                {setting3D.showNeuron&&<Box sx={{p: 5}}>
                    <Typography gutterBottom>Percentage of neurons visualized</Typography>
                    <Slider
                        value={setting3D.percent}
                        onChange={(e, nv) => handleChangeSetting3D('percent', nv)}
                    />
                </Box>}
                <FormControlLabel control={<Checkbox
                    checked={setting3D.showAllPosition}
                    onChange={(event) => handleChangeSetting3D('showAllPosition', event.target.checked)}
                />} label="Show region"/>

                <FormControlLabel control={<Checkbox
                    checked={setting3D.showOnlyConnect}
                    onChange={(event) => handleChangeSetting3D('showOnlyConnect', event.target.checked)}
                />} label="Show neurons with connections"/>

                <FormControlLabel control={<Checkbox
                    checked={setting3D.showOnlyRelatedConnect}
                    onChange={(event) => handleChangeSetting3D('showOnlyRelatedConnect', event.target.checked)}
                />} label="Only related to selected region"/>

                <Divider/>
                <FormControlLabel control={<Checkbox
                    checked={setting3D.createdin}
                    onChange={(event) => handleChangeSetting3D('createdin', event.target.checked)}
                />} label="Creation-ingoing"/>
                <FormControlLabel control={<Checkbox
                    checked={setting3D.createdout}
                    onChange={(event) => handleChangeSetting3D('createdout', event.target.checked)}
                />} label="Creation-outgoing"/>
                <FormControlLabel control={<Checkbox
                    checked={setting3D.deletedin}
                    onChange={(event) => handleChangeSetting3D('deletedin', event.target.checked)}
                />} label="Deletion-ingoing"/>
                <FormControlLabel control={<Checkbox
                    checked={setting3D.deletedout}
                    onChange={(event) => handleChangeSetting3D('deletedout', event.target.checked)}
                />} label="Deletion-outgoing"/>

                <Box sx={{p: 5}}>
                    <Typography gutterBottom>Area separation</Typography>
                    <Slider
                        value={setting3D.areaSeparation}
                        min={0}
                        max={2}
                        step={0.1}
                        onChange={(e, nv) => handleChangeSetting3D('areaSeparation', nv)}
                    />
                </Box>
            </FormGroup>
        </CardContent>
        <Divider/>
        <CardContent>
            <Typography>Neuron Timeline</Typography>
            <TextField
                label={"Time step"}
                number
                value={timestep}
                onChange={(event)=>handleChange('timestep', event.target.value)}
            />
            <SelectCheck
                title={"Monitor Types"}
                value={settingTimeline.metrics}
                getLabel={d=>monitormap[d]}
                 onChange={(event)=>handleChangeSettingTimeline('metrics',event.target.value??emptyArray)}
                 renderValue={(selected) => selected.map(d=>monitormap[d]).join(', ')}
                 options={metricList}/>

            {/*<TextField*/}
            {/*    label={"Static type"}*/}
            {/*    select*/}
            {/*    value={settingTimeline.mode}*/}
            {/*    onChange={(event)=>handleChangeSettingTimeline('mode', event.target.value)}*/}
            {/*    fullWidth*/}
            {/*>*/}
            {/*    {staticsTypes.map((option) => (*/}
            {/*        <MenuItem key={option} value={option}>*/}
            {/*            {option}*/}
            {/*        </MenuItem>*/}
            {/*    ))}*/}
            {/*</TextField>*/}
        </CardContent>
    </Card>
}