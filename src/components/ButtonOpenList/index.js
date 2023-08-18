import {
    Button,
    Checkbox,
    FormControl,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import * as PropTypes from "prop-types";
import {uniqueId} from "lodash";
import {useMemo, useState} from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    // PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
        role: 'listbox',
    // },
};

export default function ButtonOpenList({title,value,options,getLabel=d=>d,onChange,renderValue,...props}) {
    const id = useMemo(()=>uniqueId(),[]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };
    return <FormControl sx={{width:'100%'}}>
        <Button fullWidth variant={"contained"} size={"small"}
                onClick={handleClickListItem}>{title}</Button>
        <Menu
            id={id}
            open={open}
            anchorEl={anchorEl}
            // onChange={onChange}
            onClose={handleClose}
            MenuListProps={MenuProps}
            {...props}
        >
            {options.map(name=><MenuItem key={name} value={name}
                                         onClick={(event)=> {
                                             if (value.indexOf(name) > -1)
                                                 onChange(event, value.filter(d=>d!==name))
                                             else
                                                 onChange(event, [...value,name])
                                         }}
            >
                <Checkbox checked={value.indexOf(name) > -1}/>
                <ListItemText primary={getLabel(name)}/>
            </MenuItem>)}
        </Menu>
    </FormControl>;
}

ButtonOpenList.propTypes = {
    title: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.any,
    renderValue: PropTypes.func,
    options: PropTypes.any
};