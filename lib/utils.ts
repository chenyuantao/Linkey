import crypto from 'crypto';

export const val = (val: string) => (val ? `'${val}'` : 'DEFAULT');

export const buildColumns = (obj: any) =>
  Object.keys(obj)
    .map((key) => (obj[key] !== undefined ? `\`${key}\` = '${obj[key]}'` : null))
    .filter((item) => !!item)
    .join(',');

export const formatSuccessResponse = (data: any) => {
  return {
    code: 0,
    msg: 'ok',
    data,
  };
};

export const formatFailedResponse = (msg: string, data?: any) => {
  return {
    code: -1,
    msg,
    data,
  };
};

export const hashPassword = (password: string, createTime: number) =>
  crypto
    .createHash('sha256')
    .update(password + createTime)
    .digest('hex');
