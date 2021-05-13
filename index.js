import { Axios } from './axios';
import { merge, isString } from 'lodash-es';
import { ErrResponse, ContentType } from './const';
import { checkStatus } from './checkStatus';
import { checkCode } from './checkCode';

// 默认超时时间
const timeout = 10 * 1000;

const transform = {
  transformResponseData(res) {
    // console.log(res, options);
    if (!res) return ErrResponse;
    return checkCode(res?.data);
  },

  beforeRequestHook(config, options) {
    // console.log('before request', config, options);
    createLoading(options);
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(config.params)) {
        config.data = {
          params: Object.assign(config.params || {}, { '_t': new Date().getTime() })
        };
      } else {
        config.url = config.url + config.params + `_t: ${new Date().getTime()}`;
        config.params = undefined;
      }
    } else {
      if (!isString(config.params)) {
        config.data = config.params;
        config.params = undefined;
      } else {
        config.url = config.url + config.params;
        config.params = undefined;
      }
    }
    return merge(config, { requestOptions: options });
  },

  requestInterceptors(config) {
    // console.log(config);
    // header中携带token
    config.headers.Authorization = '';
    config.timeout = config.requestOptions.timeout || timeout;
    config.headers['Content-Type'] = config.requestOptions.contentType || ContentType;
    return config;
  },

  requestInterceptorsCatch(err) {
    return Promise.reject(err);
  },

  responseInterceptors(res) {
    clearLoading(res);
    return res;
  },

  responseInterceptorsCatch(err) {
    const { response, message } = err || {};
    // console.log(response, message);
    clearLoading();
    checkStatus(response?.status, message);
    return Promise.reject(err);
  }
};

// 创建接口请求loading
function createLoading(option) {
  option.loading && Toast.loading({
    message: '加载中...',
    duration: timeout,
    forbidClick: true,
    loadingType: 'circular'
  });
}

function clearLoading(res) {
  if (res?.config.requestOptions.loading) Toast.clear();
  if (!res?.config.requestOptions.pageLoading || res.data.code !== 0) {
    // 结束pageLoading
  }
}

function createAxios() {
  return new Axios({
    baseURL: '/',
    transform,
    requestOptions: {
      timeout,
      loading: false,
      pageLoading: false,
      errorMessageMode: 'message'
    }
  });
}

export const service = createAxios();
