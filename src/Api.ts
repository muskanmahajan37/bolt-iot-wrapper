import nodeFetch from 'node-fetch';
import Base from './BaseClasses/Base';
import { API_PHASE, BOLT_FUNC, CONSTANTS, EVENT, LOG_TYPE } from './Enums';
import EventListeners from './EventListeners';
import { IDeviceDetails, IResponseData } from './Interfaces';

export default class Api extends Base {

  private static lastApiCallTimeStamp: number;
  private fetch: any = null;
  private eventListeners = new EventListeners();
  constructor(private currentDevice: IDeviceDetails) {
    super();
    if (this.IsNode) {
      this.fetch = nodeFetch;
    } else {
      this.fetch = window.fetch;
    }
  }

  public async getData(functi: BOLT_FUNC, query?: string) {

    try {
      let fullUrl;
      this.eventListeners.run(EVENT.api, API_PHASE.start, functi);
      if (query) {
        fullUrl = `${CONSTANTS.baseUrl}/${this.currentDevice.key}/${functi}?
        deviceName=${this.currentDevice.name}&${query}`;
      } else {
        fullUrl = `${CONSTANTS.baseUrl}/${this.currentDevice.key}/${functi}?
        deviceName=${this.currentDevice.name}`;
      }
      const nowDate = Date.now();
      // below will give a gap of 3 seconds between api calls
      if (Api.lastApiCallTimeStamp &&
        (nowDate - Api.lastApiCallTimeStamp) < CONSTANTS.defaultApiDiff) {
        await this.setTimeoutAsync(CONSTANTS.defaultApiDiff - (nowDate - Api.lastApiCallTimeStamp));
      }

      Api.lastApiCallTimeStamp = nowDate;
      this.eventListeners.run(EVENT.api, API_PHASE.inProgress, functi);
      const res = await this.fetch(fullUrl.replace(/ /g, ''), {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data: IResponseData = await res.json();
      if (data.success.toString() === '1') {
        return data;
      }
      const msg = `Bolt cloud responded with failure: ${data.value}`;
      this.eventListeners.run(EVENT.message, LOG_TYPE.error, msg);
      this.log(LOG_TYPE.error, msg);
      return Promise.reject();
    } catch (e) {
      return Promise.reject(e.message);
    } finally {
      this.eventListeners.run(EVENT.api, API_PHASE.completed, functi);
    }

  }
}
