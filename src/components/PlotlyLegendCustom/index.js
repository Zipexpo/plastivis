import {useEffect, useState, useCallback, useMemo} from "react";
import "./index.css"
import {emptyArray, emptyObject, monitormap} from "../ulti";
import ButtonOpenList from "../ButtonOpenList";
import {annotations} from "../../providers/DataProvider/Provider";
import {useData} from "../../providers/DataProvider";

const legendgap = 20;
const legendgroup = 30;
const circleopen = ({size,color,...props})=><path className="point"
                         d={`M${size},0A${size},${size} 0 1,1 0,-${size}A${size},10 0 0,1 ${size},0Z`}
                         style={{opacity: 1, stroke: color, strokeOpacity: 1, strokeWidth: 1.5, fill: 'none'}}
                                            {...props}></path>
const squareopen = ({size,color,...props})=><path className="point"
                         d={`M${size},${size}H-${size}V-${size}H${size}Z`}
                         style={{opacity: 1, stroke: color, strokeOpacity: 1, strokeWidth: 1.5, fill: 'none'}}
                                            {...props}></path>
const triangleopen = ({size,color,...props})=><path className="point"
                         d={`M-${size*1.155},${size/2}H${size*1.155}L0,-${size}Z`}
                         style={{opacity: 1, stroke: color, strokeOpacity: 1, strokeWidth: 1.5, fill: 'none'}}
                                            {...props}></path>
const xopen = ({size,color,...props})=><path className="point"
                         d={`M0,${size*0.566}l${size*0.566},${size*0.566}l${size*0.566},-${size*0.566}l-${size*0.566},-${size*0.566}l${size*0.566},-${size*0.566}l-${size*0.566},-${size*0.566}l-${size*0.566},${size*0.566}l-${size*0.566},-${size*0.566}l-${size*0.566},${size*0.566}l${size*0.566},${size*0.566}l-${size*0.566},${size*0.566}l${size*0.566},${size*0.566}Z`}
                         style={{opacity: 1, stroke: color, strokeOpacity: 1, strokeWidth: 1.5, fill: 'none'}}
                                            {...props}></path>
const star = ({size,color,...props})=><path className="point"
                                // M2.36,-3.24H9.99L3.81,1.24L6.17,8.49                                                     L0,4.01L-6.17,8.49L-3.81,1.24L-9.99,-3.24H-2.36L0,-10.5Z
                         d={`M${size*0.314},-${size*0.432}H${size*1.33}L${size*0.508},${0.16*size}L${size*0.82},${size*1.132}L0,${size*0.53}L-${size*0.82},${size*1.132}L-${size*0.508},${size*0.16}L-${size*1.332},-${size*0.432}H-${size*0.314}L0,-${size*1.4}Z`}
                         style={{opacity: 1, stroke: color, strokeOpacity: 1, strokeWidth: 1.5, fill: 'none'}}
                                            {...props}></path>
const symbolMap = {
    "circle-open":circleopen,
    "square-open":squareopen,
    "triangle-up-open":triangleopen,
    "x-open":xopen,
    "star":star
}
export default function ({legendData,traces,onChange,onVisiblesync}){
    const [areaData,setAeaData] = useState([]);
    const [sims,setSims] = useState([]);
    const {getValue,setValue} = useData();
    const areaChooses = getValue('areaChooses')??emptyArray;
    const areaList = getValue('areaList')??emptyArray;
    const settingTimeline = getValue('settingTimeline')??emptyObject;
    const simsList = getValue('simsList')??emptyObject;
    const handleChange = ((path,value)=>{
        setValue(path,value)
    });

    const annotationMap= useMemo(()=>{
        const areamap = {};
        annotations.forEach(d=>{
            d.area.forEach(a=>{
                if (!areamap[a])
                    areamap[a] = [];
                areamap[a].push(d);
            })
        })
        return areamap
    },[])
    useEffect(()=>{
        const areaData = Object.entries(legendData.area??{});
        setAeaData(areaData);
        setSims(Object.entries(legendData.sims??{}));
        const selected = {};
        areaData.forEach(([area,d])=>(d.visible!==false)?selected[area]=true:'' )
        onVisiblesync(selected)
    },[legendData])
    const handleChangeSettingTimeline = useCallback((path,value)=>{
        setValue('settingTimeline',{...settingTimeline,[path]:value})
    },[settingTimeline])
    return <div>
        <ButtonOpenList
            size={"small"}
            title={"Edit Simulation list"}
            value={settingTimeline.sims}
            onChange={(event,newval)=>handleChangeSettingTimeline('sims',newval??emptyArray)}
            renderValue={(selected) => selected.join(', ')}
            options={simsList}
        />

        <svg height={10+(sims.length+areaData.length)*legendgap+legendgroup} style={{width:'100%'}}>
        <g transform={`translate(${20},${10})`}>
            {
                sims.map(([sim,d],i)=><g key={sim} transform={`translate(${0},${i*legendgap})`} opacity={d.visible===false?0.5:1}>
                    <line x2={30} y1={-4} y2={-4} stroke={d.line.color}/>
                    <text className={"legendCustom"} x={40}>
                        {sim}
                    </text>
                    <rect className="legendtoggle" pointerEvents="all" x="0" y={-legendgap/2} width={"100%"} height={legendgap}
                          onClick={()=> {
                              if (d.visible!==false) {
                                  d.trace.forEach(e => e.visible = 'legendonly')
                                  d.visible=false
                              }else {
                                  d.trace.forEach(e => e.visible = legendData.area[e.customdata].visible)
                                  d.visible=true;
                              }
                              setSims([...sims]);
                              onChange([...traces]);
                          }}
                    />
                </g>)
            }
            {
                areaData.map(([area,d],i)=><g key={area} transform={`translate(${0},${(sims.length+i)*legendgap+legendgroup})`}
                                              opacity={d.visible===false?0.5:1}>
                    {/*<rect width={10} height={10} fill={'none'} stroke={'#7a7a7a'} y={-8} x={-10}/>*/}
                    {/*{region[area]?<path d={`M14.1 27.2l7.1 7.2 16.7-16.8`}/>:''}*/}
                    {d.marker?symbolMap[d.marker.symbol]({size:5,color:'black',transform:`translate(${15},${-4})`}):''}
                    <text className={"legendCustom"} x={40}>
                        {area} {annotationMap[area]?`(${annotationMap[area].length} events)`:''}
                    </text>
                    <rect className="legendtoggle" pointerEvents="all" x="0" y={-legendgap/2} width={"100%"} height={legendgap}
                          onClick={()=> {
                              if (d.visible!==false) {
                                  d.trace.forEach(e => e.visible = 'legendonly')
                                  d.visible=false
                              }else {
                                  d.trace.forEach(e => e.visible = legendData.sims[e.name].visible)
                                  d.visible=true;
                              }
                              setAeaData([...areaData]);
                              onChange([...traces]);
                              const selected = {};
                              areaData.forEach(([area,d])=>(d.visible!==false)?selected[area]=true:'' )

                              onVisiblesync(selected)
                          }}/>
                </g>)
            }
        </g>
    </svg>
        <ButtonOpenList
            size={"small"}
            title={"Edit Area list"}
            value={areaChooses}
            onChange={(event,newvalue)=>handleChange('areaChooses',newvalue??emptyArray)}
            getLabel={area=>`${area} ${annotationMap[area]?`(${annotationMap[area].length} events)`:''}`}
            renderValue={(selected) => selected.join(', ')}
            options={areaList}/>
    </div>
}