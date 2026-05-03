declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  /** Minimal type stub — kullanılan kısımlar genişletilebilir. */
  class Iyzipay {
    constructor(config: IyzipayConfig);
    payment: { create: (request: unknown, cb: (err: unknown, result: unknown) => void) => void };
    threedsInitialize: { create: (request: unknown, cb: (err: unknown, result: unknown) => void) => void };
    threedsPayment: { create: (request: unknown, cb: (err: unknown, result: unknown) => void) => void };
  }

  export = Iyzipay;
}
