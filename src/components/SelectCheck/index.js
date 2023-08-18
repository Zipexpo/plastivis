import {Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select} from "@mui/material";
import * as PropTypes from "prop-types";
import {uniqueId} from "lodash";
import {useMemo} from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function SelectCheck({title,value,options,getLabel=d=>d,onChange,renderValue,...props}) {
    const id = useMemo(()=>uniqueId(),[])
    return <FormControl sx={{width:'100%'}}>
        <InputLabel id={`label${id}`}>{title}</InputLabel>
        <Select
            labelId={`label${id}`}
            id={id}
            multiple
            value={value}
            onChange={onChange}
            input={<OutlinedInput label={title}/>}
            renderValue={renderValue}
            MenuProps={MenuProps}
            {...props}
        >
            {options.map(name=><MenuItem key={name} value={name}>
                <Checkbox checked={value.indexOf(name) > -1}/>
                <ListItemText primary={getLabel(name)}/>
            </MenuItem>)}
        </Select>
    </FormControl>;
}

SelectCheck.propTypes = {
    title: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.any,
    renderValue: PropTypes.func,
    options: PropTypes.any
};