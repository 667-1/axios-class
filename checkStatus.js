
// 可使用toast进行提示
const error = message => new Error(message);

export function checkStatus(status, message) {
  // console.log('need check status', status, message);
  status = messageFilter(message) || status;
  switch (status) {
    case 'canceled':
      break;
    case 'timeout':
      error('网络超时，请重试！');
      break;
    default:
      error(message);
  }
}

function messageFilter(message) {
  if (message.includes('canceled')) return 'canceled';
  if (message.includes('timeout')) return 'timeout';
  return false;
}
