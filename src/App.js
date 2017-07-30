//See step 6

import React, { Component } from 'react'
import io from 'socket.io-client'

class App extends Component {
	constructor () {
		super()

		this.isStarted = false //RTC connection
		this.localStream			 //stores local getUserMedia stream
		this.pc          			 //stores RTCPeerConnection instance
		this.remoteStream			 //store remote stream from peer

		//Use google stun server to poke a hole in firewall
		this.pc_config = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] }

		this.pc_constraints = { 'optional': [{ 'DtlsSrtpKeyAgreement': true }] }

		// Set up audio and video regardless of what devices are present.
		this.sdpConstraints = { 'mandatory': {
  														'OfferToReceiveAudio':true,
  														'OfferToReceiveVideo':true 
  													}
  												}

  	/////////////////////////////////////////////////////

		this.contraints = { audio: true,
												video: { width: 280, height: 220 } }
		

		//socket-io
		this.socket = io(`http://localhost:3000/`) //TODO try setting dynamically
		console.log('io: ', io('http://localhost:3000/'))
		//end socket-io

		this.handleTextAreaOnChange = this.handleTextAreaOnChange.bind(this)
		this.getData = this.getData.bind(this)

	}

	sendMessage (message) {
		console.log('Client sending message: ', message)
		this.socket.emit('message', message)
	}

	handleTextAreaOnChange (event) {
		console.log('handleTextAreaOnChange', event.target.value, this.socket)

		let { value } = event.target

		this.sendMessage(value)
	}

	getData () {
		requestAnimationFrame(this.getData)
		//this.analyser.getByteTimeDomainData(this.dataArray)
		this.analyser.getByteFrequencyData(this.dataArray)

		console.log(this.dataArray)
	}

	componentDidMount () {

		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
		this.analyser = this.audioCtx.createAnalyser()
		this.analyser.fftSize = 2048
		this.bufferLength = this.analyser.frequencyBinCount
		this.dataArray = new Uint8Array(this.bufferLength)

		/////////////////////////////////////////////////////

		this.socket.on('message', message => {
			console.log('Client received message:', message)

			if(message === 'got user media') {
				this.maybeStart()
			} else if(message.type === 'offer') {
				if(!isStarted) {
					this.maybeStart()
				}

				this.pc.setRemoteDescription(new RTCSessionDescription(message))
				this.doAnswer()
			} else (message.type === 'answer' && this.isStarted) {
				this.pc.setRemoteDescription(new RTCSessionDescription(message))
			}	else if (message.type === 'candidate' && this.isStarted) {
				var candidate = new RTCIceCandidate({
					sdpMLineIndex: message.label,
      		candidate: message.candidate
				})

				this.pc.addIceCandidate(candidate)
			} else if (message === 'bye' && isStarted) {
				this.handleRemoteHangup()
			}
		})

		/////////////////////////////////////////////////////

		this.streamSuccess = stream => {

													this.localStream = stream

													//video src		
													this.video.srcObject = stream						
													this.video.onloadedmetadata = e => {
														this.video.play();
														this.video.muted = true;
													}

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

	maybeStart () {
		if(!this.isStarted && typeof this.localStream != 'undefined') {
			this.createPeerConnection()
			this.pc.addStream(this.localStream)
			this.isStarted = true
			
			this.doCall()
		}
	}

	createPeerConnection () {
		try {
			this.pc = new RTCPeerConnection(null)
			this.pc.onicecandidate = this.handleIceCandidate
			this.pc.onaddstream = this.handleRemoteStreamAdded
			pc.onremovestream = this.handleRemoteStreamRemoved
			console.log('Created RTCPeerConnnection')

		} catch (e) {
			console.log('Failed to create PeerConnection, exception: ' + e.message)
    	alert('Cannot create RTCPeerConnection object.')
			return
		}
	}

	handleIceCandidate (event) {
		console.log('handleIceCandidate event: ', event)
		if (event.candidate) {
    	this.sendMessage({
      	type: 'candidate',
      	label: event.candidate.sdpMLineIndex,
      	id: event.candidate.sdpMid,
      	candidate: event.candidate.candidate
      })
  	} else {
    	console.log('End of candidates.')
  	}
	}

	handleRemoteStreamAdded(event) {
	  console.log('Remote stream added.')
	  this.remoteVideo.src = window.URL.createObjectURL(event.stream)
	  this.remoteStream = event.stream
	}

	doCall () {
		console.log('Sending offer to peer')
  	this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError)
	}

	doAnswer() {
  	console.log('Sending answer to peer.')
  	this.pc.createAnswer(this.setLocalAndSendMessage, null, this.sdpConstraints);
	}

	//Up to setLocalAndSendMessage(

	render () {
		return (
			<div>
				<textarea onChange={this.handleTextAreaOnChange}></textarea>
				<video ref={ video => this.video = video }/>
				<video ref={ remoteVideo => this.remoteVideo = remoteVideo }/>
				<audio ref={ audio => this.audio = audio }/>
			</div>
		)
	}
}

export default App