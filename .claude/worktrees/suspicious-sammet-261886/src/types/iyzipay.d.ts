declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  /** Iyzico'dan gelen genel cevap formu. */
  interface IyzipayResult {
    status?: string;
    errorCode?: string;
    errorMessage?: string;
    errorGroup?: string;
    locale?: string;
    systemTime?: number;
    conversationId?: string;
    [key: string]: unknown;
  }

  /** Checkout Form Initialize cevabı. */
  interface CheckoutInitResult extends IyzipayResult {
    token?: string;
    checkoutFormContent?: string;
    paymentPageUrl?: string;
    tokenExpireTime?: number;
  }

  /** Checkout Form Retrieve cevabı (ödeme sonucu). */
  interface CheckoutRetrieveResult extends IyzipayResult {
    paymentStatus?: string; // SUCCESS / FAILURE
    paymentId?: string;
    price?: number;
    paidPrice?: number;
    installment?: number;
    basketId?: string;
    token?: string;
    callbackUrl?: string;
  }

  type Cb<T> = (err: Error | null, result: T) => void;

  class Iyzipay {
    constructor(config: IyzipayConfig);
    payment: {
      create: (request: unknown, cb: Cb<IyzipayResult>) => void;
    };
    threedsInitialize: {
      create: (request: unknown, cb: Cb<IyzipayResult>) => void;
    };
    threedsPayment: {
      create: (request: unknown, cb: Cb<IyzipayResult>) => void;
    };
    checkoutFormInitialize: {
      create: (request: unknown, cb: Cb<CheckoutInitResult>) => void;
    };
    checkoutForm: {
      retrieve: (request: unknown, cb: Cb<CheckoutRetrieveResult>) => void;
    };
  }

  export = Iyzipay;
}
