import axios from 'axios';
import { cloneDeep, isFunction } from 'lodash-es';
import { AxiosCanceler } from './axiosCancel';
import { ErrResponse } from './const';

export class Axios {
  constructor(options) {
    this.options = options;
    this.Instance = axios.create(options);
    this.setupInterceptors();
  }

  getTransform() {
    const { transform } = this.options;
    return transform;
  }

  setupInterceptors() {
    const transform = this.getTransform();
    const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } = transform;
    const axiosCanceler = new AxiosCanceler();

    // 请求拦截
    this.Instance.interceptors.request.use(config => {
      const { requestOptions: { ignoreCancelToken } = { ignoreCancelToken: false } } = config;
      !ignoreCancelToken && axiosCanceler.addPending(config);
      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config);
      }
      return config;
    }, undefined);

    requestInterceptorsCatch && isFunction(requestInterceptorsCatch) &&
    this.Instance.interceptors.request.use(undefined, requestInterceptorsCatch);

    // 响应拦截
    this.Instance.interceptors.response.use(res => {
      res && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, null);

    responseInterceptorsCatch && isFunction(responseInterceptorsCatch) &&
    this.Instance.interceptors.response.use(undefined, responseInterceptorsCatch);
  }

  request(config, options) {
    let conf = cloneDeep(config);

    const transform = this.getTransform();

    const { requestOptions } = this.options;

    const opt = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, transformResponseData } = transform || {};

    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }

    return new Promise((resolve, reject) => {
      this.Instance.request(conf).then(res => {
        if (transformResponseData && isFunction(transformResponseData)) {
          const tres = transformResponseData(res, opt);
          tres !== ErrResponse ? resolve(tres) : reject(res.data.message || new Error('request error!'));
        }
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
}