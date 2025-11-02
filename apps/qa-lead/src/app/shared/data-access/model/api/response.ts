export type ApiMessageParams = {
  [k: string]: string | number;
};

export type SuccessResult<T> = {
  message: string;
  data?: T;
  paramSuccess: ApiMessageParams;
};

export type ErrorResult = {
  errorKey: string;
  errorKeys?: string[];
  paramError?: ApiMessageParams;
};
