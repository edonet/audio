/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-23 14:02:36
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 获取用户多媒体设备
 *****************************************
 */
export const getUserMedia = (() => {
    let nav = navigator,
        devices = nav.mediaDevices || {};

    // 判断是否支持最新【api】
    if (devices.getUserMedia) {
        return options => devices.getUserMedia(options);
    } else {
        let getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;

        // no supported
        if (!getUserMedia) {
            return () => Promise.reject(
                new Error('getUserMedia is not implemented in this browser')
            );
        }

        // promisify
        return options => new Promise(function (resolve, reject) {
            getUserMedia.call(nav, options, resolve, reject);
        });
    }
})();
