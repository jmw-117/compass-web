export const markets = {
  global: {
    records: 'You can check a payment receipt, invoice, spreadsheet or paper ledger.',
    continuity: 'Consider how work continues if a system or internet connection is unavailable.',
  },
  KE: {
    records: 'Check a recent M-PESA payment, paper ledger, spreadsheet or eTIMS invoice.',
    continuity: 'Consider how work continues during a power cut or loss of connectivity.',
    enquiries: 'For example, follow a WhatsApp enquiry from the first message to payment.',
  },
};
export const ownership: Record<string, string> = {
  sole_proprietor:'You, as the business owner', small_sme:'The person responsible for this workflow',
  established_sme:'The accountable process owner', enterprise:'The accountable department lead',
};
export const industryExamples: Record<string,string> = {
  agriculture:'a produce delivery',trades:'a repair booking',creators:'a commission or content brief',retail:'a customer order',
  professional_services:'a client assignment',hospitality:'a booking',health:'an appointment',education:'an enrolment enquiry',
  financial_services:'a service request',manufacturing:'a production order',logistics:'a shipment',technology:'a support ticket',
};
