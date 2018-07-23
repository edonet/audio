/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-23 12:22:15
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { audioContext, createBufferSource, createGain, createAnalyser, decodeAudioData } from './audio';


/**
 *****************************************
 * 音频播放器
 *****************************************
 */
export default class Player {

    /* 初始化对象 */
    constructor() {

        // 设置属性
        this.source = null;
        this.gain = null;
        this.analyser = null;
        this.buffer = null;
        this.playing = false;
    }

    /* 播放音乐 */
    play(...args) {
        if (this.buffer) {
            this.source && this.stop();
            this.source = createBufferSource();
            this.gain = createGain();
            this.analyser = createAnalyser();
            this.source.buffer = this.buffer;
            this.source.connect(this.gain);
            this.gain.connect(this.analyser);
            this.analyser.connect(audioContext.destination);
            this.source.start ? this.source.start(...args) : this.source.noteOn(...args);
            this.playing = true;
        }
    }

    /* 停止播放 */
    stop(...args) {
        if (this.source) {
            this.source.stop ? this.source.stop(...args) : this.source.noteOff(...args);
            this.source = this.source.disconnect() && null;
            this.gain = this.gain.disconnect() && null;
            this.analyser = this.analyser.disconnect() && null;
            this.playing = false;
        }
    }

    // 从文件中读取
    loadFile(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            // 设置请求
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onerror = reject;
            xhr.onload = async () => {
                this.buffer = await decodeAudioData(xhr.response);
                resolve(this.buffer);
            };

            // 发送请求
            xhr.send();
        });
    }
}
