import { Role } from '@shared/data-access/model/api/enum/role';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';

export type AppRoute =
  | 'neck-label'
  | 'washing'
  | 'print-lead'
  | 'qa'
  | 'qa-lead'
  | 'qa-pod'
  | 'shipping'
  | 'trim'
  | 'mug-transfer'
  | 'jit-receive'
  | 'dtf-hat'
  | 'embroidery'
  | 'hangtag';

export class AppMap {
  static readonly values: AppRoute[] = [
    'neck-label',
    'washing',
    'print-lead',
    'qa',
    'qa-lead',
    'qa-pod',
    'shipping',
    'trim',
    'mug-transfer',
    'jit-receive',
    'dtf-hat',
    'embroidery',
    'hangtag',
  ];

  static readonly names = new Map<AppRoute, string>([
    ['neck-label', 'Necklabel App'],
    ['washing', 'Washing App'],
    ['print-lead', 'Print Lead App'],
    ['qa', 'QA App'],
    ['qa-lead', 'QA Lead App'],
    ['qa-pod', 'QA App'],
    ['shipping', 'Shipping App'],
    ['trim', 'Trim App'],
    ['mug-transfer', 'Mug Transfers App'],
    ['jit-receive', 'Jit Receive App'],
    ['dtf-hat', 'DTF Accessories App'],
    ['embroidery', 'Embroidery App'],
    ['hangtag', 'Hangtag App'],
  ]);

  static readonly requiredRole = new Map<AppRoute, Role[]>([
    ['neck-label', [Role.Necklabel]],
    ['washing', [Role.WashStation]],
    ['print-lead', [Role.PrintLead]],
    ['qa', [Role.QA]],
    ['qa-lead', [Role.QALead]],
    ['qa-pod', [Role.QA]],
    ['shipping', [Role.Shipping]],
    ['trim', [Role.Trim]],
    ['mug-transfer', [Role.MugTransfer]],
    ['jit-receive', [Role.JitReceivingJuarez, Role.JitReceivingTijuana]],
    ['dtf-hat', [Role.DtfHatManagement]],
    ['embroidery', [Role.Embroidery]],
    ['hangtag', []],
  ]);

  static readonly siteTitle = new Map<AppRoute, string>([
    ['neck-label', 'MDP - NeckLabel'],
    ['washing', 'MDP - Washing'],
    ['print-lead', 'MDP - PrintLead'],
    ['qa', 'MDP - QA'],
    ['qa-lead', 'MDP - QALead'],
    ['qa-pod', 'MDP - POD QA'],
    ['shipping', 'MDP - Shipping'],
    ['trim', 'MDP - Trim'],
    ['mug-transfer', 'MDP - Mug Transfer'],
    ['jit-receive', 'MDP - Jit Receive'],
    ['dtf-hat', 'MDP - DTF Accessories'],
    ['embroidery', 'MDP - Embroidery'],
    ['hangtag', 'MDP - Hangtag'],
  ]);

  static readonly apiHeaders = new Map<AppRoute, string>([
    ['neck-label', 'WebApp-NeckLabel'],
    ['washing', 'WebApp-Washing'],
    ['print-lead', 'WebApp-PrintLead'],
    ['qa', 'WebApp-Qa'],
    ['qa-lead', 'WebApp-QaLead'],
    ['qa-pod', 'WebApp-QaPod'],
    ['shipping', 'WebApp-Shipping'],
    ['trim', 'WebApp-Trim'],
    ['mug-transfer', 'WebApp-MugTransfer'],
    ['jit-receive', 'WebApp-JitReceiving'],
    ['dtf-hat', 'WebApp-DtfHatApp'],
    ['embroidery', 'WebApp-Embroidery'],
    ['hangtag', ''],
  ]);

  static readonly MD_CLIENT_ROLE = new Map<AppRoute | '', StationRole | 'Hangtag'>([
    ['neck-label', 'NeckLabel'],
    ['washing', 'WashStation'],
    ['print-lead', 'PrintLead'],
    ['qa', 'QA'],
    ['qa-lead', 'QALead'],
    ['qa-pod', 'QA'],
    ['shipping', 'Shipping'],
    ['trim', 'TrimApp'],
    ['mug-transfer', 'Mug'],
    ['jit-receive', 'JitReceivingApp'],
    ['dtf-hat', 'DTF-Hat'],
    ['embroidery', 'Embroidery'],
    ['hangtag', 'Hangtag'],
  ]);
}
