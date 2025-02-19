// const BlueElectrum = require('../blue_modules/BlueElectrum');

// export const NetworkTransactionFeeType = Object.freeze({
//   FAST: 'Fast',
//   MEDIUM: 'MEDIUM',
//   SLOW: 'SLOW',
//   CUSTOM: 'CUSTOM',
// });

// export class NetworkTransactionFee {
//   static StorageKey = 'NetworkTransactionFee';

//   constructor(fastestFee = 2, mediumFee = 1, slowFee = 1) {
//     this.fastestFee = fastestFee;
//     this.mediumFee = mediumFee;
//     this.slowFee = slowFee;
//   }
// }

// export default class NetworkTransactionFees {
//   static recommendedFees() {
//     // eslint-disable-next-line no-async-promise-executor
//     return new Promise(async resolve => {
//       try {
//         const isDisabled = await BlueElectrum.isDisabled();
//         if (isDisabled) {
//           throw new Error('Electrum is disabled. Dont attempt to fetch fees');
//         }
//         const response = await BlueElectrum.estimateFees();
//         if (typeof response === 'object') {
//           const networkFee = new NetworkTransactionFee(response.fast, response.medium, response.slow);
//           resolve(networkFee);
//         } else {
//           const networkFee = new NetworkTransactionFee(2, 1, 1);
//           resolve(networkFee);
//         }
//       } catch (err) {
//         console.warn(err);
//         const networkFee = new NetworkTransactionFee(2, 1, 1);
//         resolve(networkFee);
//       }
//     });
//   }
// }


import * as BlueElectrum from '../custom-modules/BlueElectrum';

export enum NetworkTransactionFeeType {
  FAST = 'Fast',
  MEDIUM = 'MEDIUM',
  SLOW = 'SLOW',
  CUSTOM = 'CUSTOM',
}

export class NetworkTransactionFee {
  static StorageKey = 'NetworkTransactionFee';

  public fastestFee: number;
  public mediumFee: number;
  public slowFee: number;

  constructor(fastestFee = 2, mediumFee = 1, slowFee = 1) {
    this.fastestFee = fastestFee;
    this.mediumFee = mediumFee;
    this.slowFee = slowFee;
  }
}

export default class NetworkTransactionFees {
  static async recommendedFees(): Promise<NetworkTransactionFee> {
    try {
      const isDisabled = await BlueElectrum.isDisabled();
      if (isDisabled) {
        throw new Error('Electrum is disabled. Dont attempt to fetch fees');
      }
      const response = await BlueElectrum.estimateFees();
      return new NetworkTransactionFee(response.fast + 5, response.medium + 2, response.slow);
    } catch (err) {
      console.warn(err);
      return new NetworkTransactionFee(2, 1, 1);
    }
  }
}