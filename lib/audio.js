/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-23 13:44:34
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import defer from '@arted/utils/defer';


/**
 *****************************************
 * 音频上下文
 *****************************************
 */
export const AudioContext = (
    window.AudioContext || window.webkitAudioContext || null
);


/**
 *****************************************
 * 创建【context】
 *****************************************
 */
export const audioContext = (() => {

    // 创建上下文
    if (AudioContext) {
        return new AudioContext();
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
})();


/**
 *****************************************
 * 创建【mediaStreamSource】
 *****************************************
 */
export const createMediaStreamSource = mediaStream => {

    // 创建节点
    if (audioContext && audioContext.createMediaStreamSource) {
        return audioContext.createMediaStreamSource(mediaStream);
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
};


/**
 *****************************************
 * 创建【scriptNode】
 *****************************************
 */
export const createScriptNode = ({ bufferSize, channelCount } = {}) => {

    // 创建节点
    if (audioContext) {
        if (audioContext.createScriptProcessor) {
            return audioContext.createScriptProcessor(bufferSize, channelCount, channelCount);
        } else if (audioContext.createJavaScriptNode) {
            return audioContext.createJavaScriptNode(bufferSize, channelCount, channelCount);
        }
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
};


/**
 *****************************************
 * 创建【analyser】
 *****************************************
 */
export const createAnalyser = () => {

    // 创建节点
    if (audioContext && audioContext.createAnalyser) {
        return audioContext.createAnalyser();
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
};


/**
 *****************************************
 * 创建【bufferSource】
 *****************************************
 */
export const createBufferSource = () => {

    // 创建节点
    if (audioContext && audioContext.createBufferSource) {
        return audioContext.createBufferSource();
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
};


/**
 *****************************************
 * 解码数据
 *****************************************
 */
export const decodeAudioData = audioData => {
    let { resolve, reject, promise } = defer(),
        result = audioContext.decodeAudioData(audioData, resolve, reject);

    // 返回对象
    return result || promise;
};


/**
 *****************************************
 * 创建【gain】
 *****************************************
 */
export const createGain = () => {

    // 创建节点
    if (audioContext && audioContext.createGain) {
        return audioContext.createGain();
    }

    // 抛出错误
    throw new Error('AudioContext not supported!');
};
