"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (params, world) => {
    if (!params || !world || typeof params !== 'object') {
        throw new Error('Missing params and secret world');
    }
    let result = {};
    let paramsArr = [];
    let url = 'https://pay.freekassa.ru/?';
    if (params.oa) {
        params.oa = parseFloat(params.oa).toString();
    }
    if (params.m && params.oa && params.o) {
        paramsArr.push(params.m);
        paramsArr.push(params.oa);
        paramsArr.push(world);
        paramsArr.push(params.currency);
        paramsArr.push(params.o);
    }
    else if (params['MERCHANT_ID'] && params['AMOUNT'] && params['MERCHANT_ORDER_ID']) {
        paramsArr.push(params['MERCHANT_ID']);
        paramsArr.push(params['AMOUNT']);
        paramsArr.push(world);
        paramsArr.push(params['MERCHANT_ORDER_ID']);
        return {
            signature: require('crypto').createHash('md5').update(paramsArr.join(':')).digest('hex'),
        };
    }
    else {
        throw new Error('Required parameters are not specified');
    }
    result.signature = require('crypto').createHash('md5').update(paramsArr.join(':')).digest('hex');
    params.s = result.signature;
    const keys = Object.keys(params);
    keys.forEach(function (p, k) {
        url += p + '=' + encodeURIComponent(params[p]) + (k !== keys.length - 1 ? '&' : '');
    });
    result.url = url;
    return result;
};
//# sourceMappingURL=MakePaymentUrl.js.map