export interface ContractFormData {
  contractCode: string
  contractType: string
  startDate: string
  endDate: string
  signedDate: string
  status: string
  occupantCount: string
  rentAmount: string
  depositAmount: string
  serviceFee: string
  paymentDay: string
  paymentCycle: string
  motelId: string
  roomId: string
  tenantId: string
  note: string
}

export const EMPTY_FORM: ContractFormData = {
  contractCode: '',
  contractType: '',
  startDate: '',
  endDate: '',
  signedDate: '',
  status: '',
  occupantCount: '',
  rentAmount: '',
  depositAmount: '',
  serviceFee: '',
  paymentDay: '',
  paymentCycle: 'monthly',
  motelId: '',
  roomId: '',
  tenantId: '',
  note: '',
}
