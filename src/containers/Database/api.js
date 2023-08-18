import axios from "axios";
import {_apps} from "./internal"
import {isArray} from "lodash";

class API {
    constructor(host, name, onAuthFalse) {
        this.name = name ?? "api";
        this.isInit = false;
        this.baseUrl = host ?? 'localhost:4000';
    }

    getParameter(name,config={}) {
        return axios.get(`${this.baseUrl}/parameter/${name}`,config);
    }

    getPCA(query,config={}) {
        return axios.get(`${this.baseUrl}/pca?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    get3ddataConnection(query,config={}) {
        return axios.get(`${this.baseUrl}/3ddataConnection?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    get3Ddata(query,config={}) {
        return axios.get(`${this.baseUrl}/3ddata?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    get3DdataRegion(query,config={}) {
        return axios.get(`${this.baseUrl}/3ddataRegion?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getTimeseriesByRegion(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/region?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getTimeseriesNetworkByRegion(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/region/network?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getScatterByRegion(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/region/scatter?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getParallelCoords(query,config={}) {
        return axios.get(`${this.baseUrl}/ParallelCoords?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getTimeseriesByNeuron(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/neuron?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }
    getTimeseriesOutlierByNeuron(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/neuronOUtlier?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }

    getTimeseriesBrain(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/brain?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }
    getTimeseriesOutlierBrain(query,config={}) {
        return axios.get(`${this.baseUrl}/timeseries/brainOUtlier?${Object.entries(query).map(s => isArray(s[1])?s[1].map(e => `${s[0]}=${e}`):[`${s[0]}=${s[1]}`]).flat().join('&')}`,config);
    }
}

function getApp(name = 'api') {
    return _apps.get(name);
}

function initializeApp(name, {host}, onAuthFalse) {
    let api = getApp(name);
    if (!api) {
        api = _apps.set(name, new API(host, name, onAuthFalse))
    }
    api.baseUrl = host;
    api.isInit = true;
}

export {getApp, initializeApp};