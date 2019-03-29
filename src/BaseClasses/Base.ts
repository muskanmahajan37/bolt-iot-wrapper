import { IDeviceDetails } from '../Interfaces';

export default abstract class Base {

  protected static devices: IDeviceDetails[] = [];
  protected setTimeoutAsync(time: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
        // tslint:disable-next-line: align
      }, time);
    });
  }

  protected get IsNode() {
    return typeof process !== 'undefined' && process.release && process.release.name === 'node';
  }
}