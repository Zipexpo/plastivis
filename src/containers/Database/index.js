import {getApp, initializeApp} from "./api";
import DataProvider from "../../providers/DataProvider"

export default function ({ children }) {

    if (!getApp('api')) {
        initializeApp('api',
            {host:process.env.NODE_ENV !== "production" ? 'http://127.0.0.1:5000' : ''}
        );
    }
    return (
        <DataProvider name={'api'}>
                {children}
        </DataProvider>
    )
}