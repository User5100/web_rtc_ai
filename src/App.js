//See step 6

import React, { Component } from 'react'
import io from 'socket.io-client'

class App extends Component {
	constructor () {
		super()

		this.contraints = { audio: true }
		// , video: { width: 1280, height: 720 }

		//socket-io
		this.socket = io(`http://localhost:3000/`) //TODO try setting dynamically
		console.log('io: ', io('http://localhost:3000/'))
		//end socket-io

		this.handleTextAreaOnChange = this.handleTextAreaOnChange.bind(this)
		this.getData = this.getData.bind(this)

	}

	handleTextAreaOnChange (event) {
		console.log('handleTextAreaOnChange', event.target.value, this.socket)

		let { value } = event.target

		this.socket.emit('textMessage', value)
	}

	getData () {
		requestAnimationFrame(this.getData)
		//this.analyser.getByteTimeDomainData(this.dataArray)
		this.analyser.getByteFrequencyData(this.dataArray)

		//console.log(this.dataArray)
	}

	componentDidMount () {

		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
		this.analyser = this.audioCtx.createAnalyser()
		this.analyser.fftSize = 2048
		this.bufferLength = this.analyser.frequencyBinCount
		this.dataArray = new Uint8Array(this.bufferLength)

		this.streamSuccess = stream => {	
													//video src
													/*
													this.video.srcObject = stream						
													this.video.onloadedmetadata = e => {
														this.video.play();
														this.video.muted = true;
													}
													<video ref={ video => this.video = video }/>
													*/

													//audio src
													this.audio.srcObject = stream			
													this.audio.onloadedmetadata = e => {
														this.audio.play();
														this.audio.muted = true;
													}

													//analyser
													this.source = this.audioCtx.createMediaStreamSource(stream)
													this.source.connect(this.analyser)
													this.getData()
												}

		navigator.mediaDevices
						 	.getUserMedia(this.contraints)
						 	.then(this.streamSuccess)
							.catch(err => {
								console.log(err)
							})
	}

	render () {
		return (
			<div>
				<textarea onChange={this.handleTextAreaOnChange}></textarea>
				
				<audio ref={ audio => this.audio = audio }/>
			</div>
		)
	}
}

export default App