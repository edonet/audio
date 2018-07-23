/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-23 17:04:30
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import React, { Component } from 'react';
import Player from '../lib/player';


/**
 *****************************************
 * 音频播放器
 *****************************************
 */
export default class AudioPlayer extends Component {

    /* 初始化组件 */
    constructor(props, ...args) {
        super(props, ...args);

        // 创建播放器
        this.player = new Player();
        this.deferred = null;

        // 定义状态
        this.state = { src: null, refresh: false };

        // 绑定回调
        this.handleClick = this.handleClick.bind(this);
    }

    /* 更新状态 */
    static getDerivedStateFromProps(props, state) {
        return {
            src: props.src,
            refresh: props.src && props.src !== state.src
        };
    }

    /* 渲染组件 */
    render() {

        // 更新文件
        this.state.refresh && this.loadFile();

        // 返回元素
        return <div onClick={ this.handleClick }>点击播放</div>;
    }

    /* 监听点击事件 */
    handleClick() {
        this.deferred && this.deferred.then(() => {
            this.player.playing ? this.player.stop() : this.player.play();
            this.player.playing && this.props.onPlay(this.player);
        });
    }

    /* 加载文件 */
    loadFile() {
        this.player.stop();
        this.deferred = this.player.loadFile(this.state.src);
    }
}
