import fetch from "node-fetch";
import Base from "./Base";
import { IResponseData, IDeviceDetails } from "./Interfaces";
import { CONSTANTS } from './Enums';



export default class Api extends Base {

    private static lastApiCallTimeStamp: number;
    constructor(private currentDevice: IDeviceDetails) {
        super();
    }


    async getData(functi: string, query?: string) {

        try {
            let fullUrl;
            if (query) {
                fullUrl = `${CONSTANTS.baseUrl}/${this.currentDevice.key}/${functi}?deviceName=${this.currentDevice.name}&${query}`;
            }
            else {
                fullUrl = `${CONSTANTS.baseUrl}/${this.currentDevice.key}/${functi}?deviceName=${this.currentDevice.name}`;
            }
            const nowDate = Date.now();
            //below will give a gap of 3 seconds between api calls
            if (Api.lastApiCallTimeStamp && (nowDate - Api.lastApiCallTimeStamp) < CONSTANTS.defaultApiDiff) {
                await this.setTimeoutAsync(CONSTANTS.defaultApiDiff - (nowDate - Api.lastApiCallTimeStamp));
            }

            Api.lastApiCallTimeStamp = nowDate;
            const res = await fetch(fullUrl, {
                headers: {
                    'Cache-Control': "no-cache"
                }
            });
            const data: IResponseData = await res.json();
            if (data.success === '1') {
                return data;
            }

            throw new Error('Cloud responsed with failure');
        }
        catch (e) {
            return Promise.reject(e.message)
        }

    }
}