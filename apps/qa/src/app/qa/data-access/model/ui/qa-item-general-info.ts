import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';

export type QaItemGeneralInfo = {
  isPriority: boolean;
  partnerId: string;
  orderId: number;
  partnerOrderId: string;
  barcode: string;
  status: ItemTransitionStatus | null;
  statusName: string;
  sku: string;
  cooName: string | null;
  isAllowChangeCoo: boolean;
  quantity: number;
  slaDateOnUtc: Date;
  isJit: boolean;
  preQrCode: string | null;
};
