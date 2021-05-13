import { ErrResponse } from './const';

// 可使用toast进行提示
const error = message => new Errpr(message);

export function checkCode(data) {
  // 可根据业务自行设置
  let { code, message } = data || null;
  // console.log('need check code', code, message);
  code = messageFilter(message) || code;
  switch (code) {
    case 0 :
      return data;
    case 'canceled':
      return data;
    default:
      error(message);
      return ErrResponse;
  }
}

function messageFilter(message) {
  if (message.includes('canceled')) return 'canceled';
  return false;
}
