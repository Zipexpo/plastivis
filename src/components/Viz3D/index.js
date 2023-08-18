import React, {
    useRef,
    memo,
    useEffect,
    useMemo,
    useState,
    createRef,
    useTransition,
    useCallback
} from "react";
import {Canvas, useFrame} from "@react-three/fiber";
import CameraComponentOrbit from "./CameraComponentOrbit";
import {EffectComposer, Bloom} from '@react-three/postprocessing';
import {interpolateTurbo, interpolateBuPu} from "d3-scale-chromatic";
import {scaleSequential,scalePow} from "d3-scale";
import {mean as d3mean, groups as d3groups, sum as d3sum, min as d3min} from "d3";
import "./index.css"
import niceColors from 'nice-color-palettes'

import {
    Html,
    OrbitControls,
    Text,
    View,
    Instance, Instances, CatmullRomLine, Sphere, Center, Segments, Segment, Line, SoftShadows
} from "@react-three/drei";
import {extent, scaleLinear, max as d3max} from "d3";
import * as THREE from "three";
import {emptyArray, emptyObject} from "../ulti";
import ColorLegend from "../ColorLegend";
import {Grid, Stack} from "@mui/material";
import useRefs from 'react-use-refs'

const sMax = 5;
const scaleInit = scaleLinear().domain([0, 186]).range([0, sMax]);
const scaleSizeInit = scalePow().exponent(1/3).range([0.5,3]);
export default function ({
                             data, views=emptyArray, timestep,showData, dataRange,
                             showNetcreatedin,
                             showNetcreatedout,
                             showNetdeletedin,
                             showNetdeletedout,
                             showSub, netData, netRange,
                             subdata, subdataValue, subRange,
                             filter = 100, name = "", nodekey = "neurons",
                             choosenId, choosenArea=emptyObject,
                             showOnlyConnect = true,
                             showOnlyRelatedConnect = true,
                             onChoose,
                             areaSeparation,
                             netBySub
                         }) {

    // const myOrbit = useRef();
    const [hover, setHover] = useState();
    const [scheme, setScheme] = useState({views: [], colorScale: scaleSequential(interpolateTurbo)});
    const [subdataScheme, setSubdataScheme] = useState({colorScale: scaleSequential(interpolateTurbo)});
    const [ref, ref1, ref2, ref3, ref4] = useRefs()
    const [scale, setScale] = useState({xScale: scaleInit,
        yScale: scaleInit, zScale: scaleInit});
    const scaleSize = useMemo(()=>{
        const listrange=[]
        Object.keys(netRange).forEach(sim=>listrange.push(netRange[sim].created.min,netRange[sim].created.max,
            netRange[sim].deleted.min,netRange[sim].deleted.max))
        return scalePow().exponent(1/3).range([0.5,3]).domain([0,extent(listrange)[1]])
    },[netRange])
    const [_subNodes, set_SubNodes] = useState([]);
    const [subNodes, setSubNodes] = useState([]);
    const [_netData, set_netData] = useState({});
    const [countNeuronConnection, setCountNeuronConnection] = useState({});
    const [netDraw, setNetDraw] = useState({});
    const [areaList, setAreaList] = useState([]);
    const [_areaList, set_AreaList] = useState({});
    const [centerVector, setCenterVector] = useState([0, 0, 0]);
    const [freeze, setFreeze] = useState(false);
    const [isPending, startTransition] = useTransition();
    useEffect(()=>{
        setScheme({views:views.map(k=>({name: k, nodes:[]}))})
    },[views])
    useEffect(() => {

        const rangelist = [];
        Object.keys(subdataValue).forEach(k => {
            rangelist.push(subRange[k].min, subRange[k].max);
        })

        const colorScale = scaleSequential(interpolateTurbo).domain(extent(rangelist));
        setSubdataScheme({colorScale})
    }, [subdataValue, subRange])
    useEffect(() => {
        if (subdata.length) {
            const {xScale, yScale, zScale} = scale;
            const subnodes = subdata.map((d, i) => {
                const item = {
                    index: i,
                    data: d,
                    pos: [xScale(d['pos x']), yScale(d['pos y']), zScale(d['pos z'])]
                }
                return item;
            });
            const xMeanC = d3mean(subnodes, d => d.pos[0]);
            const yMeanC = d3mean(subnodes, d => d.pos[1]);
            const zMeanC = d3mean(subnodes, d => d.pos[2]);
            const vec = new THREE.Vector3();
            const groupsRegion = d3groups(subnodes, d => d.data.area);
            groupsRegion.forEach(d => {
                const xMean = d3mean(d[1], d => d.pos[0]);
                const yMean = d3mean(d[1], d => d.pos[1]);
                const zMean = d3mean(d[1], d => d.pos[2]);
                d.center = [xMean, yMean, zMean];
                vec.set(xMeanC - xMean, yMeanC - yMean, zMeanC - zMean);
                vec.normalize().multiplyScalar(-areaSeparation);
                d[1].forEach(e => {
                    e.pos = [e.pos[0] + vec.x, e.pos[1] + vec.y, e.pos[2] + vec.z]
                })
            })

            // subnodes._regionMap = d3group(subnodes,d=>d.data.area);
            setSubNodes(subnodes)

            // setScale({x: xScale, y: yScale, z: zScale})

            setCenterVector([xMeanC - 2.5, yMeanC - 2.5, zMeanC - 2.5])
        }
    }, [subdata, scale,areaSeparation]);
    useEffect(() => {
        // calculate size setSubNodesSize

        if (subNodes.length) {
            const countNeuronConnection = {}

            Object.keys(netData).forEach(sim => {
                countNeuronConnection[sim]={}
                subNodes.forEach(d=>{
                    countNeuronConnection[sim][d.index] = 0;
                })
                netData[sim].forEach((d, i) => {
                    d.data.forEach(([sourceId, targetId]) => {
                        countNeuronConnection[sim][sourceId - 1]++;
                        countNeuronConnection[sim][targetId - 1]++;
                    });
                })
            });
            setCountNeuronConnection(countNeuronConnection);
        }
        if (!showOnlyRelatedConnect) {
            set_netData(netData)
        } else {
            // fileter
            const _netData = {};
            const _area = {};
            Object.keys(netData).forEach(sim => {
                _netData[sim] = netData[sim].map((d, i) => {
                    const newdata = d.data.filter(([sourceId, targetId]) => {
                        const fitsource = (choosenArea[subNodes[sourceId - 1].data.area]);
                        const fittarget = (choosenArea[subNodes[targetId - 1].data.area]);
                        if (fitsource)
                        {
                            if (!_area[subNodes[targetId - 1].data.area])
                                _area[subNodes[targetId - 1].data.area] = 0;
                            _area[subNodes[targetId - 1].data.area]++;
                            return true
                        }else if (fittarget){
                            if (!_area[subNodes[sourceId - 1].data.area])
                                _area[subNodes[sourceId - 1].data.area] = 0;
                            _area[subNodes[sourceId - 1].data.area]++;
                            return true
                        }
                        return false
                    });
                    return {...d, data: newdata}
                })
            });
            const area = Object.entries(_area);
            area.sort((a,b)=>b[1]-a[1]);
            subNodes.forEach(d=>d.highlight=choosenArea[d.data.area])
            set_netData(_netData)
            setAreaList(area);
        }
    }, [choosenArea, showOnlyRelatedConnect, netData, subNodes])
    useEffect(() => {
        if (subNodes.length) {
            // get position and get size
            const netDraw = {};
            Object.keys(_netData).forEach(sim => {
                netDraw[sim] = _netData[sim].map(({type, data}) => {
                    return data.map(([sourceId, targetId]) => {
                        return [subNodes[sourceId - 1].pos, subNodes[targetId - 1].pos]
                    })
                })
            })
            setNetDraw(netDraw)
        }
    }, [subNodes, _netData]);
    const getColor = useCallback((data,name)=>(subdataValue[name] && subdataValue[name][data.data.area]) ? subdataScheme.colorScale(subdataValue[name][data.data.area]) : '#ffffff',
        [subdataValue,subdataScheme])
    useEffect(() => {
        const listSIm = Object.keys(_netData);
        subNodes.forEach(n=> {
            n.scale = {};
            n.color = {};
            listSIm.forEach(name=> {
                n.color[name] = getColor(n, name);
                n.scale[name] = scaleSize(countNeuronConnection[name][n.index]);
            });
        })

        if (showOnlyConnect && subNodes.length) {
            const netDraw = {};
            const nodes = {};
            const condition = [showNetcreatedin, showNetcreatedout, showNetdeletedin, showNetdeletedout];
            Object.keys(_netData).forEach(sim => {
                _netData[sim].forEach(({type, data}, i) => {
                    if (condition[i]) {
                        data.forEach(([sourceId, targetId],j) => {
                            nodes[sourceId - 1] = subNodes[sourceId - 1];
                            nodes[targetId - 1] = subNodes[targetId - 1];
                            // if (((sourceId) ===26582)||((targetId) ===26582)) {
                            //     console.log(data[i])
                            //     debugger
                            // }
                        })
                    }
                })
            })
            const _nodes = Object.values(nodes);
            set_SubNodes(_nodes);
        } else {
            set_SubNodes(subNodes)
        }
    }, [showOnlyConnect, showOnlyRelatedConnect, subNodes,countNeuronConnection, _netData,
        showNetcreatedin, showNetcreatedout, showNetdeletedin, showNetdeletedout,getColor]);
    useEffect(()=>{
        const flatData = [];
        const _areaList = {};
        Object.keys(netBySub).forEach(sim=>{
            _areaList[sim] = [];
            netBySub[sim].forEach(d=>{
                const item = {...d};
                item.sum = d3sum(item.data);
                flatData.push(item)
                _areaList[sim].push(item)
            })
        })
        const range = [d3min(flatData,d=>d3min(d.data)),d3max(flatData,d=>d.sum)];
        const scalebar = scaleLinear().domain(range).range((range[1]!==0)?[0,100]:[0,0]);
        flatData.forEach(d=> {
            d.bar = d.data.map(d=>({rate:scalebar(d),color:'blue'}));
            d.bar[2].color = 'red'
            d.bar[3].color = 'red'
        })
        Object.keys(_areaList).forEach(sim=>{
            _areaList[sim].sort((a,b)=>b.sum-a.sum);
        })
        debugger
        set_AreaList(_areaList)
    },[netBySub])
    const onPointerChoose = useCallback((e, obj) => {
        startTransition(() => {
            e.stopPropagation();
            onChoose(obj.data.neuronID ?? obj.data['local id'], obj.data.area);
        });
    }, [scheme]);
    const onPointerOver = useCallback((e, obj) => {
        if(freeze)
            return
        startTransition(() => {
            e.stopPropagation();
            // scheme
            if (obj.neighbor)
                obj.neighbor.forEach(d => d.highlight = true);
            // obj.highlight = true;
            setHover(obj);
        });
    }, [hover, scheme]);
    const onPointerOut = useCallback((e, obj) => {
        if(freeze)
            return
        startTransition(() => {
            e.stopPropagation();
            if (obj.neighbor)
                obj.neighbor.forEach(d => d.highlight = false);
            // obj.highlight = false;
            if (hover === obj) {
                setHover(undefined);
            }
        });
    }, [hover, scheme]);
    const refList = useMemo(()=>[ref1,ref2,ref3,ref4],[]);
    return <div ref={ref} className={'container'}>
        <Grid container
              direction="row"
              justifyContent="center"
              className={'container'}
        >
            <Grid item xs={scheme.views.length < 2 ? 12 : 6} ref={ref1} style={{height: (scheme.views.length > 2 ? '50%' : '100%'),overflow:'hidden'}}/>
            <Grid item xs={scheme.views.length < 2 ? 12 : 6} ref={ref2} style={{height: (scheme.views.length > 2 ? '50%' : '100%'),overflow:'hidden'}}/>
            <Grid item xs={scheme.views.length < 2 ? 12 : 6} ref={ref3} style={{height: (scheme.views.length > 2 ? '50%' : '100%'),overflow:'hidden'}}/>
            <Grid item xs={scheme.views.length < 2 ? 12 : 6} ref={ref4} style={{height: (scheme.views.length > 2 ? '50%' : '100%'),overflow:'hidden'}}/>
        </Grid>
        <Canvas
            eventSource={ref}
            className="canvas"
            shadows
            // style={{overflow: 'visible'}}
            raycaster={{params: {Points: {threshold: 0.01}}}}
            camera={{position: [10, 12, 12], fov: 25}}
            // onCreated={(state) => {
            //     state.gl.localClippingEnabled = true;
            // }}

        >
            <color attach="background" args={['black']}/>

            {
                scheme.views.map(({nodes, links, name}, i) => <View
                    index={i + 1}
                    track={refList[i]} key={`view${i}`}>
                    <color attach="background" args={['#4b4b4b']}/>
                    <ambientLight intensity={0.5} />
                    {/*<directionalLight position={[150, 150, 150]} intensity={1} />*/}
                    {/*<ambientLight />*/}
                    <spotLight angle={0.25} penumbra={0.5} position={[10, 10, 5]} castShadow />
                    <group position={[-2.5, -2.5, -2.5]}>
                        <Text position={[-3, -3, 1]} scale={0.5}>{name}</Text>
                        {/*<Center>*/}

                        {/*<Segments key={`seg0_view${i}_${(netDraw[name] ?? [[]])[0].length}`}*/}
                        {/*          limit={50000} range={(netDraw[name] ?? [[]])[0].length}*/}
                        <Segments key={`seg0_view${i}_${(netDraw[name] ?? [[]])[0].length}`}
                                  limit={(netDraw[name] ?? [[]])[0].length}
                                  lineWidth={1.0} visible={showNetcreatedin} frustumCulled={false}>
                            {(netDraw[name] ?? [[]])[0].map((d, i) => <Segment key={`created${d}`} start={d[0]}
                                                                               end={d[1]} color="blue"/>)}
                        </Segments>
                        <Segments key={`seg1_view${i}_${(netDraw[name] ?? [[],[]])[1].length}`}
                                  limit={(netDraw[name] ?? [[],[]])[1].length}
                                  lineWidth={1.0} visible={showNetcreatedout}>
                            {(netDraw[name] ?? [[], []])[1].map((d, i) => <Segment key={`created${d}`} start={d[0]}
                                                                                   end={d[1]} color="blue"/>)}
                        </Segments>
                        <Segments key={`seg2_view${i}_${(netDraw[name] ?? [[],[],[]])[2].length}`}
                            limit={(netDraw[name] ?? [[],[],[]])[2].length}
                                  lineWidth={1.0} visible={showNetdeletedin}>
                            {(netDraw[name] ?? [[], [], []])[2].map((d, i) => <Segment key={`deleted${d}`} start={d[0]}
                                                                                       end={d[1]} color="red"/>)}
                        </Segments>
                        <Segments key={`seg3_view${i}_${(netDraw[name] ?? [[],[],[],[]])[3].length}`}
                            limit={(netDraw[name] ?? [[],[],[],[]])[3].length}
                                  lineWidth={1.0} visible={showNetdeletedout}>
                            {(netDraw[name] ?? [[], [], [], []])[3].map((d, i) => <Segment key={`deleted${d}`}
                                                                                           start={d[0]} end={d[1]}
                                                                                           color="red"/>)}
                        </Segments>

                        {/*<Instances limit={50000} visible={showSub}>*/}
                        {/*    <sphereGeometry args={[0.02, 10, 10]}/>*/}
                        {/*    <meshStandardMaterial roughness={1}/>*/}
                        {/*    {_subNodes.map((data) => (*/}
                        {/*        <Instance key={`neuron_o${data.index}`}*/}
                        {/*                  position={data.pos}*/}
                        {/*                  color={(subdataValue[name] && subdataValue[name][data.data.area]) ? subdataScheme.colorScale(subdataValue[name][data.data.area]) : '#ffffff'}*/}
                        {/*                  scale={(data.data.area === choosenArea) ? 2 : 1}*/}
                        {/*                  onPointerOver={(e) => onPointerOver(e, data)}*/}
                        {/*                  onPointerOut={(e) => onPointerOut(e, data)}*/}
                        {/*                  onClick={(e) => onPointerChoose(e, data)}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</Instances>*/}
                        <Neuron
                            // key={`neuron_${i}_${_subNodes.length}`}
                            visible={showSub}
                            data={_subNodes}
                            // instanceProps={{
                            //     onPointerOver: (e) => onPointerOver(e, _subNodes[e.instanceId]),
                            //     onPointerOut:(e) => onPointerOut(e, _subNodes[e.instanceId]),
                            //     // onClick:(e) => onPointerChoose(e, _subNodes[e.instanceId])
                            // }}
                            onPointerOver={ (e) => onPointerOver(e, _subNodes[e.instanceId])}
                        onPointerOut={(e) => onPointerOut(e, _subNodes[e.instanceId])}
                            name={name}
                            // getColor={getColor}
                        />
                        <SoftShadows />
                        {hover ? <Html zIndexRange={[100, 2]} position={hover.pos} style={{pointerEvents: 'none'}}>
                            <div style={{
                                position: 'relative',
                                margin: 10,
                                padding: 2,
                                minWidth: 100,
                                backgroundColor: '#ddd',
                                borderRadius: 5
                            }}>
                                ID:{hover.data['local id']}
                                <br/>
                                Area: {hover.data.area}
                            </div>
                        </Html> : ''}
                        <Instances limit={50000} visible={showData} range={Math.round(nodes.length * filter / 100)}>
                            <boxGeometry args={[0.01, 0.01, 1]}/>
                            <meshLambertMaterial toneMapped={false}/>
                            {nodes.map((obj, i) => (
                                <Box key={i} position={obj.pos} color={obj.color ?? '#ff0000'}
                                     scale={[obj.highlight ? 10 : ((obj.data.neuronID === choosenId) ? 5 : 1), obj.highlight ? 10 : ((obj.data.neuronID === choosenId) ? 5 : 1), obj.valueScale]}
                                     onPointerOver={(e) => onPointerOver(e, obj)}
                                     onPointerOut={(e) => onPointerOut(e, obj)}
                                     onClick={(e) => onPointerChoose(e, obj)}
                                     lookAt={centerVector}
                                />
                            ))}
                        </Instances>

                    </group>
                </View>)
            }
            {/*<EffectComposer>*/}
            {/*    <Bloom mipmapBlur luminanceThreshold={1} radius={0.7}/>*/}
            {/*</EffectComposer>*/}
            {/*<GizmoHelper alignment="bottom-right" margin={[80, 80]}>*/}
            {/*    <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white"/>*/}
            {/*</GizmoHelper>*/}
            {/*<CameraComponentOrbit ref={myOrbit} makeDefault/>*/}
            <OrbitControls makeDefault position={[10, 12, 12]} fov={25}
                           onStart={(e)=> {
                               setFreeze(true);
                               setHover(undefined)
                           }}
                           onPointerUp={(e)=> {
                               setFreeze(false);
                           }}
            />
        </Canvas>
        <div className={"legendDiv"} style={{width: 200, height: 10, margin: 10}}>
            <span>Timestep: {timestep}</span>
            <br/>
            {showData && <><span style={{color: "white"}}>{name}</span>
                <ColorLegend colorScale={scheme.colorScale}
                             textColor={"white"}
                             range={scheme.colorScale.domain()}
                             style={{overflow: 'visible', paddingRight: 10}}/></>}
            {showSub && <><span style={{color: "white"}}>{name} (Region)</span>
                <ColorLegend colorScale={subdataScheme.colorScale}
                             textColor={"white"}
                             range={subdataScheme.colorScale.domain()}
                             style={{overflow: 'visible', paddingRight: 10}}/></>}
            {Object.keys(netDraw).map(sim => <div key={sim}>
                <span>Synaptic events for "{sim}" simulation</span>
                {[[showNetcreatedin, showNetcreatedout], [showNetdeletedin, showNetdeletedout]].map((c, i) => <div
                    key={i}>
                    <span style={{color: i ? 'red' : 'blue'}}>#{i ? "Deleted" : "Created"} connection: </span>
                    <br/>
                    {c.map((t, ii) => <span key={[i, ii]}
                                            style={{marginLeft: ii ? 30 : 10}}>{ii ? 'out' : 'in'}: {netDraw[sim][i * 2 + ii].length}</span>)}
                </div>)}
                {
                    showOnlyRelatedConnect ? <div style={{overflowY: 'auto',maxHeight:200}}>
                    <span>Connection list of {Object.keys(choosenArea).join(', ')}</span>
                    <ul>
                        {areaList.map(k => <li key={k[0]}>{k[0]} ({k[1]})</li>)}
                    </ul>
                    </div>:
                        (_areaList[sim]?<div style={{overflowY: 'auto',maxHeight:200}}>
                            <Stack className={"animationList"} sx={{height:16*_areaList[sim].length, position:'relative'}}>
                                {_areaList[sim].map((k,i) => <div key={k.name} style={{order:i,display:'flex',position:'absolute',top:16*i,left:0, width:'100%'}}>
                                    <div style={{width:60,display:'inline-block'}}>{k.name}</div> <div style={{width:'calc( 100% - 60px )',position:'relative',display:'inline-block'}}>
                                    <Stack direction={'row'}>
                                    {k.bar.map(k=><div className={"barVis"} style={{backgroundColor: k.color, width: `${k.rate}%`}}>

                                    </div>)}
                                </Stack></div>
                                </div>)}
                            </Stack>
                        </div>:'')
                }
            </div>)}
        </div>
    </div>
}

function Box({id, color, lookAt, scale = 1, instanProps = emptyObject, temp = new THREE.Object3D(), ...props}) {
    const ref = useRef()
    useEffect(() => {
        if (ref.current)
            ref.current.lookAt(...lookAt)
    }, [lookAt])
    return (
        <group {...props}>
            <Instance ref={ref} color={color} scale={scale} {...instanProps}/>
        </group>
    )
}

// const o = new THREE.Object3D()
function Neuron({data,limit = 50000, size = [0.02, 15, 15],instanceProps={},name, ...props}) {
    const ref = useRef()
    // const colors = useMemo(() => new Float32Array(data.map((data) => data.color?c.set(getColor(data,name)).toArray()).flat()), [data,name])
    useFrame(() => {
        try {
            if (ref.current) {
                const o = new THREE.Object3D()
                data.forEach((data, i) => {
                    o.position.set(...data.pos);
                    o.scale.set(data.scale[name] ?? 1, data.scale[name] ?? 1, data.scale[name] ?? 1);
                    o.updateMatrix();
                    ref.current.setMatrixAt(i, o.matrix)
                    // ref.current.setColorAt (i, new THREE.Color(getColor(data,name)))
                    if (data.color)
                        ref.current.setColorAt(i, new THREE.Color(data.color[name]))
                })
                ref.current.instanceMatrix.needsUpdate = true;
                if (ref.current.instanceColor)
                    ref.current.instanceColor.needsUpdate = true;
            }
        } catch (e){

        }
    }, [data,name])
    if (data.length < 1) return null
    return (
            <instancedMesh ref={ref} args={[null, null, data.length]} {...props}>
                <sphereGeometry attach="geometry" args={[0.02, 10, 10]}>
                </sphereGeometry>
                <meshStandardMaterial attach="material" roughness={0.38} metalness={0.5} toneMapped={false}/>
            </instancedMesh>
    )
}