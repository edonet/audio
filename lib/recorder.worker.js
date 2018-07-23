/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-17 22:10:33
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 定义接口
 *****************************************
 */
let worker = this,
    recordSize = 0,
    recordBuffers = [],
    channelCount = 0,
    sampleRate = null,
    commands = {
        init, record, exportFile, exportBuffer, clear
    };


/**
 *****************************************
 * 监听事件
 *****************************************
 */
worker.onmessage = function (e) {
    commands[e.data.command] && commands[e.data.command](e.data);
};


/**
 *****************************************
 * 初始化
 *****************************************
 */
function init({ config }) {
    sampleRate = config.sampleRate;
    channelCount = config.channelCount;
    eachChannels(idx => recordBuffers[idx] = []);
}


/**
 *****************************************
 * 添加录制内容
 *****************************************
 */
function record({ buffer }) {
    recordSize += buffer[0].length;
    eachChannels((idx, channel) => channel.push(buffer[idx]));
}


/**
 *****************************************
 * 导出录制的音频
 *****************************************
 */
function exportFile({ id, type }) {
    switch (type) {
        case 'audio/wav':
            return createWAVFile(id, type);
        default:
            break;
    }
}


/**
 *****************************************
 * 创建【WAV】文件
 *****************************************
 */
function createWAVFile(id, type) {
    let buffers = [],
        interleaved;

    // 拼接通道
    eachChannels(
        (idx, channel) => buffers.push(mergeBuffers(channel, recordSize))
    );

    // 混合通道
    interleaved = channelCount === 2 ? interleave(buffers[0], buffers[1]) : buffers[0];

    // 传送结果
    worker.postMessage({
        id,
        payload: new Blob([encodeWAV(interleaved)], { type: type })
    });
}


/**
 *****************************************
 * 获取数据流
 *****************************************
 */
function exportBuffer({ id }) {
    let buffers = [];

    // 拼接通道
    eachChannels(
        (idx, channel) => buffers.push(mergeBuffers(channel, recordSize))
    );

    // 传送结果
    worker.postMessage({ id, payload: buffers });
}


/**
 *****************************************
 * 清空对象
 *****************************************
 */
function clear() {
    recordSize = 0;
    recordBuffers = [];
    eachChannels(idx => recordBuffers[idx] = []);
}


/**
 *****************************************
 * 遍历通道
 *****************************************
 */
function eachChannels(callback) {
    for (let i = 0; i < channelCount; i++) {
        callback(i, recordBuffers[i]);
    }
}


/**
 *****************************************
 * 合并数据流
 *****************************************
 */
function mergeBuffers(channel, size) {
    let result = new Float32Array(size),
        offset = 0;

    // 合并流
    for (let i = 0, len = channel.length; i < len; i++) {
        result.set(channel[i], offset);
        offset += channel[i].length;
    }

    return result;
}


/**
 *****************************************
 * 合成通道
 *****************************************
 */
function interleave(leftBuffer, rightBuffer) {
    let length = leftBuffer.length + rightBuffer.length,
        result = new Float32Array(length),
        offset = 0,
        index = 0;

    // 拼接通道
    while (offset < length) {
        result[offset ++] = leftBuffer[index];
        result[offset ++] = rightBuffer[index];
        index ++;
    }

    return result;
}


/**
 *****************************************
 * 编码【WAV】
 *****************************************
 */
function encodeWAV(samples) {
    let buffer = new ArrayBuffer(44 + samples.length * 2),
        view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');

    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);

    /* RIFF type */
    writeString(view, 8, 'WAVE');

    /* format chunk identifier */
    writeString(view, 12, 'fmt ');

    /* format chunk length */
    view.setUint32(16, 16, true);

    /* sample format (raw) */
    view.setUint16(20, 1, true);

    /* channel count */
    view.setUint16(22, channelCount, true);

    /* sample rate */
    view.setUint32(24, sampleRate, true);

    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);

    /* block align (channel count * bytes per sample) */
    view.setUint16(32, channelCount * 2, true);

    /* bits per sample */
    view.setUint16(34, 16, true);

    /* data chunk identifier */
    writeString(view, 36, 'data');

    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    /* tranform */
    floatTo16BitPCM(view, 44, samples);

    return view;
}


/**
 *****************************************
 * 写入数据
 *****************************************
 */
function writeString(view, offset, string) {
    for (let i = 0, len = string.length; i < len; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 *****************************************
 * float to 16bit
 *****************************************
 */
function floatTo16BitPCM(output, offset, input) {
    for (let i = 0, len = input.length; i < len; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}
