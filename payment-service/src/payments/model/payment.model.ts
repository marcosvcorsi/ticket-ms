import { PaymentDocument } from '../schemas/payment.schema';

export class PaymentModel {
  id: string;
  chargeId: string;
  order: {
    id: string;
  };
  version: number;

  static fromDocument(document: PaymentDocument): PaymentModel {
    return {
      id: document._id,
      chargeId: document.chargeId,
      order: {
        id: document.order._id,
      },
      version: document.version,
    };
  }
}
