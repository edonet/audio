/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-23 12:04:48
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import createRecorderWorker from './recorder.worker';
import { audioContext, createMediaStreamSource, createScriptNode, createAnalyser } from './audio';
import { getUserMedia } from './utils';


/**
 *****************************************
 * 音频采集器
 *****************************************
 */
export default class Recorder {

    /* 初始化对象 */
    constructor(options) {

        // 定义属性
        this.uuid = 0;
        this.recording = false;
        this.mimeType = 'audio/wav';
        this.options = { bufferSize: 4096, channelCount: 2, ...options };

        // 定义对象
        this.mediaStream = null;
        this.source = null;
        this.analyser = null;
        this.script = null;

        // 创建工作线程
        this.worker = createRecorderWorker();
        this.callbacks = [];

        // 监听事件
        this.worker.onmessage = ({ data: { id, payload } }) => {
            this.callbacks = this.callbacks.filter(cb => {
                return id === cb.id ? cb.handler.call(this, payload) && false : true;
            });
        };

        // 初始化【worker】
        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: audioContext.sampleRate,
                channelCount: this.options.channelCount
            }
        });
    }

    /* 启动连接 */
    async connect(callback) {
        let { channelCount } = this.options;

        // 创建对象
        this.mediaStream = await getUserMedia({ audio: true });
        this.source = createMediaStreamSource(this.mediaStream);
        this.analyser = createAnalyser();
        this.script = createScriptNode(this.options);

        // 建立连接
        this.source.connect(this.analyser);
        this.analyser.connect(this.script);
        this.script.connect(audioContext.destination);

        // 监听数据回调
        this.script.onaudioprocess = e => {
            if (this.recording) {
                let buffer = [];

                // 获取各通道
                for (let i = 0; i < channelCount; i++) {
                    buffer.push(e.inputBuffer.getChannelData(i));
                }

                // 发送数据
                this.worker.postMessage({ command: 'record', buffer: buffer });
            }
        };


        // 执行回调
        if (typeof callback === 'function') {
            callback.call(this);
        }
    }

    /* 开始录制 */
    start() {
        this.recording = true;
    }

    /* 停止录制 */
    stop() {
        this.recording = false;
    }

    /* 清空内容 */
    clear() {
        this.worker.postMessage({ command: 'clear' });
    }

    /* 导出数据流 */
    exportBuffer(callback) {
        return new Promise(resolve => {

            // 添加回调
            this.callbacks.push({
                id: this.uuid,
                handler: payload => {
                    typeof callback === 'function' && callback.call(this, payload);
                    resolve(payload);
                }
            });

            // 发送命令
            this.worker.postMessage({ id: this.uuid ++, command: 'exportBuffer' });
        });
    }

    /* 导出文件 */
    exportFile(type, callback) {

        // 重载函数
        if (arguments.length < 2) {
            return this.exportFile(this.mimeType, type);
        }

        // 返回【promise】
        return new Promise(resolve => {

            // 添加回调
            this.callbacks.push({
                id: this.uuid,
                handler: payload => {
                    typeof callback === 'function' && callback.call(this, payload);
                    resolve(payload);
                }
            });

            // 发送命令
            this.worker.postMessage({ id: this.uuid ++, type, command: 'exportFile' });
        });
    }

    /* 销毁内容 */
    disconnect() {
        if (this.mediaStream) {
            this.mediaStream = null;
            this.source = this.source.disconnect() && null;
            this.analyser = this.analyser.disconnect() && null;
            this.script = this.script.disconnect() && null;
            this.recording = false;
            this.callbacks = [];
            this.clear();
        }
    }
}
