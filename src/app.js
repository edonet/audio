/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-17 21:16:31
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import React, { Component } from 'react';
import debounce from '@arted/utils/debounce';
import animate from '@arted/animate';
import Recorder from '../lib/recorder';
import AudioPlayer from './player';


/**
 *****************************************
 * App
 *****************************************
 */
export default class App extends Component {

    /* 初始化组件 */
    constructor(...args) {
        super(...args);

        // 定义属性
        this.$$recorder = new Recorder();

        // 创建动画
        this.$$recorderAnim = null;
        this.$$playAnim = null;

        // 定义状态
        this.state = { files: [] };

        // 绑定回调
        this.handleTouchStart = debounce(this.handleTouchStart.bind(this));
        this.handleTouchEnd = debounce(this.handleTouchEnd.bind(this));
        this.handlePlay = this.handlePlay.bind(this);
    }

    /* 渲染组件 */
    render() {
        let props = {
                onTouchStart: this.handleTouchStart,
                onTouchCancel: this.handleTouchEnd,
                onTouchEnd: this.handleTouchEnd,
                onMouseDown: this.handleTouchStart,
                onMouseUp: this.handleTouchEnd
            };

        // 返回元素
        return (
            <div>
                <div { ...props }>开始录制</div>
                <canvas id="recorder" />
                <ul>{ this.renderFileList() }</ul>
                <canvas id="player" />
            </div>
        );
    }

    /* 挂载完成 */
    async componentDidMount() {

        // 建立连接
        await this.$$recorder.connect();

        // 创建视图
        this.createVisualizer(document.getElementById('recorder'));
    }

    /* 渲染列表 */
    renderFileList() {
        return this.state.files.map((blob, idx) => (
            <li key={ idx }>
                <AudioPlayer src={ URL.createObjectURL(blob) } onPlay={ this.handlePlay } />
            </li>
        ));
    }

    /* 监听触控开始事件 */
    handleTouchStart() {
        this.$$recorder && this.$$recorder.start();
    }

    /* 监听触控结束事件 */
    handleTouchEnd() {
        if (this.$$recorder) {
            this.$$recorder.stop();
            this.$$recorder.exportFile(file => {
                console.log(file);
                this.setState({ files: [...this.state.files, file] });
                this.$$recorder.clear();
            });
        }
    }

    /* 创建波形图 */
    createVisualizer(canvas, options = {}) {
        let recorder = this.$$recorder,
            analyser = recorder.analyser,
            canvasContext = canvas.getContext('2d'),
            bufferSize = analyser.frequencyBinCount,
            dataArray = new Uint8Array(bufferSize);

        // 配置信息
        analyser.fftSize = 2048;

        // 设置画布
        canvasContext.lineWidth = options.lineWidth || 2;
        canvasContext.strokeStyle = options.color || '#f00';
        canvasContext.fillStyle = options.backgroundColor || '#fff';

        // 生成动画
        this.$$recorderAnim = animate(() => {
            let { width, height } = canvas;

            // 更新画面
            canvasContext.fillRect(0, 0, width, height);

            // 显示录制波形
            if (recorder.recording) {
                let sliceWidth = width * 1.0 / bufferSize,
                    x = 0;

                // 获取数据
                analyser.getByteTimeDomainData(dataArray);

                // 开始绘制
                canvasContext.beginPath();

                // 遍历数据
                for (let i = 0; i < bufferSize; i++) {
                    let v = dataArray[i] / 128.0,
                        y = v * height / 2;

                    i === 0 ? canvasContext.moveTo(x, y) : canvasContext.lineTo(x, y);
                    x += sliceWidth;
                }

                // 绘制线条
                canvasContext.lineTo(canvas.width, canvas.height / 2);
                canvasContext.stroke();
            }
        });
    }

    /* 监听播放 */
    handlePlay(player, options = {}) {
        let canvas = document.getElementById('player'),
            analyser = player.analyser,
            canvasContext = canvas.getContext('2d'),
            bufferSize = analyser.frequencyBinCount,
            dataArray = new Uint8Array(bufferSize);

        // 配置信息
        analyser.fftSize = 2048;

        // 设置画布
        canvasContext.lineWidth = options.lineWidth || 2;
        canvasContext.strokeStyle = options.color || '#f00';
        canvasContext.fillStyle = options.backgroundColor || '#fff';

        // 创建动画
        this.$$playAnim && this.$$playAnim.stop();
        this.$$playAnim = animate(() => {
            let { width, height } = canvas;

            // 更新画面
            canvasContext.fillRect(0, 0, width, height);

            // 显示录制波形
            if (player.playing) {
                let sliceWidth = width * 1.0 / bufferSize,
                    x = 0;

                // 获取数据
                analyser.getByteTimeDomainData(dataArray);

                // 开始绘制
                canvasContext.beginPath();

                // 遍历数据
                for (let i = 0; i < bufferSize; i++) {
                    let v = dataArray[i] / 128.0,
                        y = v * height / 2;

                    i === 0 ? canvasContext.moveTo(x, y) : canvasContext.lineTo(x, y);
                    x += sliceWidth;
                }

                // 绘制线条
                canvasContext.lineTo(canvas.width, canvas.height / 2);
                canvasContext.stroke();
            }
        });
    }

    /* 即将卸载 */
    componentWillUnmount() {
        this.$$recorder = this.$$recorder && this.$$recorder.disconnect() && null;
        this.$$recorderAnim = this.$$recorderAnim && this.$$recorderAnim.stop() && null;
        this.$$playAnim = this.$$playAnim && this.$$playAnim.stop() && null;
    }
}
