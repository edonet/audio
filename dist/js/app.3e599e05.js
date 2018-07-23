(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{137:function(n,e){n.exports=function(n){return function(){return new Worker(n)}}(window.URL.createObjectURL(new Blob(["/**\n *****************************************\n * Created by lifx\n * Created on 2018-07-17 22:10:33\n *****************************************\n */\n'use strict';\n\n\n/**\n *****************************************\n * 定义接口\n *****************************************\n */\nlet worker = this,\n    recordSize = 0,\n    recordBuffers = [],\n    channelCount = 0,\n    sampleRate = null,\n    commands = {\n        init, record, exportFile, exportBuffer, clear\n    };\n\n\n/**\n *****************************************\n * 监听事件\n *****************************************\n */\nworker.onmessage = function (e) {\n    commands[e.data.command] && commands[e.data.command](e.data);\n};\n\n\n/**\n *****************************************\n * 初始化\n *****************************************\n */\nfunction init({ config }) {\n    sampleRate = config.sampleRate;\n    channelCount = config.channelCount;\n    eachChannels(idx => recordBuffers[idx] = []);\n}\n\n\n/**\n *****************************************\n * 添加录制内容\n *****************************************\n */\nfunction record({ buffer }) {\n    recordSize += buffer[0].length;\n    eachChannels((idx, channel) => channel.push(buffer[idx]));\n}\n\n\n/**\n *****************************************\n * 导出录制的音频\n *****************************************\n */\nfunction exportFile({ id, type }) {\n    switch (type) {\n        case 'audio/wav':\n            return createWAVFile(id, type);\n        default:\n            break;\n    }\n}\n\n\n/**\n *****************************************\n * 创建【WAV】文件\n *****************************************\n */\nfunction createWAVFile(id, type) {\n    let buffers = [],\n        interleaved;\n\n    // 拼接通道\n    eachChannels(\n        (idx, channel) => buffers.push(mergeBuffers(channel, recordSize))\n    );\n\n    // 混合通道\n    interleaved = channelCount === 2 ? interleave(buffers[0], buffers[1]) : buffers[0];\n\n    // 传送结果\n    worker.postMessage({\n        id,\n        payload: new Blob([encodeWAV(interleaved)], { type: type })\n    });\n}\n\n\n/**\n *****************************************\n * 获取数据流\n *****************************************\n */\nfunction exportBuffer({ id }) {\n    let buffers = [];\n\n    // 拼接通道\n    eachChannels(\n        (idx, channel) => buffers.push(mergeBuffers(channel, recordSize))\n    );\n\n    // 传送结果\n    worker.postMessage({ id, payload: buffers });\n}\n\n\n/**\n *****************************************\n * 清空对象\n *****************************************\n */\nfunction clear() {\n    recordSize = 0;\n    recordBuffers = [];\n    eachChannels(idx => recordBuffers[idx] = []);\n}\n\n\n/**\n *****************************************\n * 遍历通道\n *****************************************\n */\nfunction eachChannels(callback) {\n    for (let i = 0; i < channelCount; i++) {\n        callback(i, recordBuffers[i]);\n    }\n}\n\n\n/**\n *****************************************\n * 合并数据流\n *****************************************\n */\nfunction mergeBuffers(channel, size) {\n    let result = new Float32Array(size),\n        offset = 0;\n\n    // 合并流\n    for (let i = 0, len = channel.length; i < len; i++) {\n        result.set(channel[i], offset);\n        offset += channel[i].length;\n    }\n\n    return result;\n}\n\n\n/**\n *****************************************\n * 合成通道\n *****************************************\n */\nfunction interleave(leftBuffer, rightBuffer) {\n    let length = leftBuffer.length + rightBuffer.length,\n        result = new Float32Array(length),\n        offset = 0,\n        index = 0;\n\n    // 拼接通道\n    while (offset < length) {\n        result[offset ++] = leftBuffer[index];\n        result[offset ++] = rightBuffer[index];\n        index ++;\n    }\n\n    return result;\n}\n\n\n/**\n *****************************************\n * 编码【WAV】\n *****************************************\n */\nfunction encodeWAV(samples) {\n    let buffer = new ArrayBuffer(44 + samples.length * 2),\n        view = new DataView(buffer);\n\n    /* RIFF identifier */\n    writeString(view, 0, 'RIFF');\n\n    /* RIFF chunk length */\n    view.setUint32(4, 36 + samples.length * 2, true);\n\n    /* RIFF type */\n    writeString(view, 8, 'WAVE');\n\n    /* format chunk identifier */\n    writeString(view, 12, 'fmt ');\n\n    /* format chunk length */\n    view.setUint32(16, 16, true);\n\n    /* sample format (raw) */\n    view.setUint16(20, 1, true);\n\n    /* channel count */\n    view.setUint16(22, channelCount, true);\n\n    /* sample rate */\n    view.setUint32(24, sampleRate, true);\n\n    /* byte rate (sample rate * block align) */\n    view.setUint32(28, sampleRate * 4, true);\n\n    /* block align (channel count * bytes per sample) */\n    view.setUint16(32, channelCount * 2, true);\n\n    /* bits per sample */\n    view.setUint16(34, 16, true);\n\n    /* data chunk identifier */\n    writeString(view, 36, 'data');\n\n    /* data chunk length */\n    view.setUint32(40, samples.length * 2, true);\n\n    /* tranform */\n    floatTo16BitPCM(view, 44, samples);\n\n    return view;\n}\n\n\n/**\n *****************************************\n * 写入数据\n *****************************************\n */\nfunction writeString(view, offset, string) {\n    for (let i = 0, len = string.length; i < len; i++) {\n        view.setUint8(offset + i, string.charCodeAt(i));\n    }\n}\n\n/**\n *****************************************\n * float to 16bit\n *****************************************\n */\nfunction floatTo16BitPCM(output, offset, input) {\n    for (let i = 0, len = input.length; i < len; i++, offset += 2) {\n        let s = Math.max(-1, Math.min(1, input[i]));\n        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);\n    }\n}\n"],{type:"text/javascript"})))},139:function(n,e,t){t(140),n.exports=t(353)},353:function(n,e,t){"use strict";t.r(e);var r=t(11),i=t.n(r),o=t(136),a=t(30),s=t.n(a),c=t(93),u=t.n(c),l=t(94),f=t.n(l),h=t(137),d=t.n(h),p=t(138),y=t.n(p),v=window.AudioContext||window.webkitAudioContext||null,m=function(){if(v)return new v;throw new Error("AudioContext not supported!")}(),w=function(n){if(m&&m.createMediaStreamSource)return m.createMediaStreamSource(n);throw new Error("AudioContext not supported!")},g=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=n.bufferSize,t=n.channelCount;if(m){if(m.createScriptProcessor)return m.createScriptProcessor(e,t,t);if(m.createJavaScriptNode)return m.createJavaScriptNode(e,t,t)}throw new Error("AudioContext not supported!")},b=function(){if(m&&m.createAnalyser)return m.createAnalyser();throw new Error("AudioContext not supported!")},k=function(n){var e=y()(),t=e.resolve,r=e.reject,i=e.promise;return m.decodeAudioData(n,t,r)||i},x=function(){var n=navigator,e=n.mediaDevices||{};if(e.getUserMedia)return function(n){return e.getUserMedia(n)};var t=n.getUserMedia||n.webkitGetUserMedia||n.mozGetUserMedia;return t?function(e){return new Promise(function(r,i){t.call(n,e,r,i)})}:function(){return Promise.reject(new Error("getUserMedia is not implemented in this browser"))}}(),C=function(){function n(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}();var $=function(){function n(e){var t=this;!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),this.uuid=0,this.recording=!1,this.mimeType="audio/wav",this.options=Object.assign({bufferSize:4096,channelCount:2},e),this.mediaStream=null,this.source=null,this.analyser=null,this.script=null,this.worker=d()(),this.callbacks=[],this.worker.onmessage=function(n){var e=n.data,r=e.id,i=e.payload;t.callbacks=t.callbacks.filter(function(n){return r!==n.id||n.handler.call(t,i)&&!1})},this.worker.postMessage({command:"init",config:{sampleRate:m.sampleRate,channelCount:this.options.channelCount}})}return C(n,[{key:"connect",value:function(){var n=function(n){return function(){var e=n.apply(this,arguments);return new Promise(function(n,t){return function r(i,o){try{var a=e[i](o),s=a.value}catch(n){return void t(n)}if(!a.done)return Promise.resolve(s).then(function(n){r("next",n)},function(n){r("throw",n)});n(s)}("next")})}}(s.a.mark(function n(e){var t,r=this;return s.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return t=this.options.channelCount,n.next=3,x({audio:!0});case 3:this.mediaStream=n.sent,this.source=w(this.mediaStream),this.analyser=b(),this.script=g(this.options),this.source.connect(this.analyser),this.analyser.connect(this.script),this.script.connect(m.destination),this.script.onaudioprocess=function(n){if(r.recording){for(var e=[],i=0;i<t;i++)e.push(n.inputBuffer.getChannelData(i));r.worker.postMessage({command:"record",buffer:e})}},"function"==typeof e&&e.call(this);case 12:case"end":return n.stop()}},n,this)}));return function(e){return n.apply(this,arguments)}}()},{key:"start",value:function(){this.recording=!0}},{key:"stop",value:function(){this.recording=!1}},{key:"clear",value:function(){this.worker.postMessage({command:"clear"})}},{key:"exportBuffer",value:function(n){var e=this;return new Promise(function(t){e.callbacks.push({id:e.uuid,handler:function(r){"function"==typeof n&&n.call(e,r),t(r)}}),e.worker.postMessage({id:e.uuid++,command:"exportBuffer"})})}},{key:"exportFile",value:function(n,e){var t=this;return arguments.length<2?this.exportFile(this.mimeType,n):new Promise(function(r){t.callbacks.push({id:t.uuid,handler:function(n){"function"==typeof e&&e.call(t,n),r(n)}}),t.worker.postMessage({id:t.uuid++,type:n,command:"exportFile"})})}},{key:"disconnect",value:function(){this.mediaStream&&(this.mediaStream=null,this.source=this.source.disconnect()&&null,this.analyser=this.analyser.disconnect()&&null,this.script=this.script.disconnect()&&null,this.recording=!1,this.callbacks=[],this.clear())}}]),n}(),S=function(){function n(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}();var A=function(){function n(){!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),this.source=null,this.gain=null,this.analyser=null,this.buffer=null,this.playing=!1}return S(n,[{key:"play",value:function(){var n,e;this.buffer&&(this.source&&this.stop(),this.source=function(){if(m&&m.createBufferSource)return m.createBufferSource();throw new Error("AudioContext not supported!")}(),this.gain=function(){if(m&&m.createGain)return m.createGain();throw new Error("AudioContext not supported!")}(),this.analyser=b(),this.source.buffer=this.buffer,this.source.connect(this.gain),this.gain.connect(this.analyser),this.analyser.connect(m.destination),this.source.start?(n=this.source).start.apply(n,arguments):(e=this.source).noteOn.apply(e,arguments),this.playing=!0)}},{key:"stop",value:function(){var n,e;this.source&&(this.source.stop?(n=this.source).stop.apply(n,arguments):(e=this.source).noteOff.apply(e,arguments),this.source=this.source.disconnect()&&null,this.gain=this.gain.disconnect()&&null,this.analyser=this.analyser.disconnect()&&null,this.playing=!1)}},{key:"loadFile",value:function(n){var e=this;return new Promise(function(t,r){var i=new XMLHttpRequest;i.open("GET",n,!0),i.responseType="arraybuffer",i.onerror=r,i.onload=function(n){return function(){var e=n.apply(this,arguments);return new Promise(function(n,t){return function r(i,o){try{var a=e[i](o),s=a.value}catch(n){return void t(n)}if(!a.done)return Promise.resolve(s).then(function(n){r("next",n)},function(n){r("throw",n)});n(s)}("next")})}}(s.a.mark(function n(){return s.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,k(i.response);case 2:e.buffer=n.sent,t(e.buffer);case 4:case"end":return n.stop()}},n,e)})),i.send()})}}]),n}(),E=function(){function n(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}();var P=function(n){function e(n){var t;!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);for(var r=arguments.length,i=Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];var a=function(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?n:e}(this,(t=e.__proto__||Object.getPrototypeOf(e)).call.apply(t,[this,n].concat(i)));return a.player=new A,a.deferred=null,a.state={src:null,refresh:!1},a.handleClick=a.handleClick.bind(a),a}return function(n,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}(e,r["Component"]),E(e,[{key:"render",value:function(){return this.state.refresh&&this.loadFile(),i.a.createElement("div",{onClick:this.handleClick},"点击播放")}},{key:"handleClick",value:function(){var n=this;this.deferred&&this.deferred.then(function(){n.player.playing?n.player.stop():n.player.play(),n.player.playing&&n.props.onPlay(n.player)})}},{key:"loadFile",value:function(){this.player.stop(),this.deferred=this.player.loadFile(this.state.src)}}],[{key:"getDerivedStateFromProps",value:function(n,e){return{src:n.src,refresh:n.src&&n.src!==e.src}}}]),e}(),T=function(){function n(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}();var B=function(n){function e(){var n;!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);for(var t=arguments.length,r=Array(t),i=0;i<t;i++)r[i]=arguments[i];var o=function(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?n:e}(this,(n=e.__proto__||Object.getPrototypeOf(e)).call.apply(n,[this].concat(r)));return o.$$recorder=new $({channelCount:1}),o.$$recorderAnim=null,o.$$playAnim=null,o.state={files:[]},o.handleTouchStart=u()(o.handleTouchStart.bind(o)),o.handleTouchEnd=u()(o.handleTouchEnd.bind(o)),o.handlePlay=o.handlePlay.bind(o),o}return function(n,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}(e,r["Component"]),T(e,[{key:"render",value:function(){var n={onTouchStart:this.handleTouchStart,onTouchCancel:this.handleTouchEnd,onTouchEnd:this.handleTouchEnd,onMouseDown:this.handleTouchStart,onMouseUp:this.handleTouchEnd};return i.a.createElement("div",null,i.a.createElement("div",n,"开始录制"),i.a.createElement("canvas",{id:"recorder"}),i.a.createElement("ul",null,this.renderFileList()),i.a.createElement("canvas",{id:"player"}))}},{key:"componentDidMount",value:function(){var n=function(n){return function(){var e=n.apply(this,arguments);return new Promise(function(n,t){return function r(i,o){try{var a=e[i](o),s=a.value}catch(n){return void t(n)}if(!a.done)return Promise.resolve(s).then(function(n){r("next",n)},function(n){r("throw",n)});n(s)}("next")})}}(s.a.mark(function n(){return s.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,this.$$recorder.connect();case 2:this.createVisualizer(document.getElementById("recorder"));case 3:case"end":return n.stop()}},n,this)}));return function(){return n.apply(this,arguments)}}()},{key:"renderFileList",value:function(){var n=this;return this.state.files.map(function(e,t){return i.a.createElement("li",{key:t},i.a.createElement(P,{src:URL.createObjectURL(e),onPlay:n.handlePlay}))})}},{key:"handleTouchStart",value:function(){this.$$recorder&&this.$$recorder.start()}},{key:"handleTouchEnd",value:function(){var n=this;this.$$recorder&&(this.$$recorder.stop(),this.$$recorder.exportFile(function(e){console.log(e),n.setState({files:[].concat(function(n){if(Array.isArray(n)){for(var e=0,t=Array(n.length);e<n.length;e++)t[e]=n[e];return t}return Array.from(n)}(n.state.files),[e])}),n.$$recorder.clear()}))}},{key:"createVisualizer",value:function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=this.$$recorder,r=t.analyser,i=n.getContext("2d"),o=r.frequencyBinCount,a=new Uint8Array(o);r.fftSize=2048,i.lineWidth=e.lineWidth||2,i.strokeStyle=e.color||"#f00",i.fillStyle=e.backgroundColor||"#fff",this.$$recorderAnim=f()(function(){var e=n.width,s=n.height;if(i.fillRect(0,0,e,s),t.recording){var c=1*e/o,u=0;r.getByteTimeDomainData(a),i.beginPath();for(var l=0;l<o;l++){var f=a[l]/128*s/2;0===l?i.moveTo(u,f):i.lineTo(u,f),u+=c}i.lineTo(n.width,n.height/2),i.stroke()}})}},{key:"handlePlay",value:function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=document.getElementById("player"),r=n.analyser,i=t.getContext("2d"),o=r.frequencyBinCount,a=new Uint8Array(o);r.fftSize=2048,i.lineWidth=e.lineWidth||2,i.strokeStyle=e.color||"#f00",i.fillStyle=e.backgroundColor||"#fff",this.$$playAnim&&this.$$playAnim.stop(),this.$$playAnim=f()(function(){var e=t.width,s=t.height;if(i.fillRect(0,0,e,s),n.playing){var c=1*e/o,u=0;r.getByteTimeDomainData(a),i.beginPath();for(var l=0;l<o;l++){var f=a[l]/128*s/2;0===l?i.moveTo(u,f):i.lineTo(u,f),u+=c}i.lineTo(t.width,t.height/2),i.stroke()}})}},{key:"componentWillUnmount",value:function(){this.$$recorder=this.$$recorder&&this.$$recorder.disconnect()&&null,this.$$recorderAnim=this.$$recorderAnim&&this.$$recorderAnim.stop()&&null,this.$$playAnim=this.$$playAnim&&this.$$playAnim.stop()&&null}}]),e}();Object(o.render)(i.a.createElement(B,null),document.getElementById("app"))}},[[139,2,1]]]);