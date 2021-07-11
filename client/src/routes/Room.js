import React, { useRef, useEffect, useState } from "react";
import './Icons';
import io from "socket.io-client";
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';
import copy from 'copy-to-clipboard';

const Container = styled.div`
  position: fixed;
  background: #000000;
  width: 100vw;
  height: 93vh;
`;

const Video = styled.video`
  border-radius: 10px;
  width: 100%;
  overflow: hidden;
  background: #000000;
`;

//added for msg
const Message = styled.div`
    // border: 1px solid black;
    margin-top: 10px;
`;

const MessageBox = styled.textarea`
    backgroud-color: white;
    width: 20vw;
    height: 100%;
`;

const MyMessage = styled.div`
  background-color: #ADB5BD;
  border-radius: 10px; 
  color: black;
  border: 1px solid lightgray;
  padding: 10px;
  margin-right: 5px;
  text-align: center;
`;

const MyRow = styled.div`
  backgroud-color: white;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  overflow: hidden;
`;

const PartnerRow = styled(MyRow)`
  justify-content: flex-start;
`;

const PartnerMessage = styled.div`
  background-color: black;
  color: white;
  border-radius: 10px; 
  border: 1px solid lightgray;
  padding: 10px;
  margin-left: 5px;
  text-align: center;
`;

const Room = (props) => {
    const [isMuted, setMuted] = useState(false);
    const [isPlaying, setPlaying] = useState(true);
    const [stream, setStream] = useState();
    const [chatShow, setChatShow] = useState(false);
    const [text, setText] = useState("");
    const [message, setMessage] = useState([]);

    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socket = useRef();
    const otherUser = useRef();
    const userStream = useRef();
    const sendChannel = useRef();


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
            setStream(stream);
            userVideo.current.srcObject = stream;
            userStream.current = stream;
            userVideo.current.muted = true;

            socket.current = io.connect("/");
            socket.current.emit("join room", props.match.params.roomID);

            socket.current.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socket.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socket.current.on("offer", handleRecieveCall);

            socket.current.on("answer", handleAnswer);

            socket.current.on("ice-candidate", handleNewICECandidateMsg);

            // added for message
            // socket.on("createMessage", message => {
            //     ("ul").append(`<li className="message">${message}</li>`)
            // });
            // message addition ends here
        });

    }, []);

    function callUser(userID) {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        // added for msg
        sendChannel.current = peerRef.current.createDataChannel("sendChannel");
        sendChannel.current.onmessage = handleReceiveMessage;
    }

    // added for msg
    function handleReceiveMessage(e) {
        setMessage(message => [...message, { yours: false, value: e.data }]);
    }



    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            // trickel: false,
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                // {
                //     url: 'turn:192.158.29.39:3478?transport=udp',
                //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                //     username: '28224511:1379330808'
                // },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;
    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socket.current.id,
                sdp: peerRef.current.localDescription
            };
            socket.current.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socket.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function toggleChat() {
        if (chatShow) {
            setChatShow(false);
        }
        else {
            setChatShow(true);
        }
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        // added for msg
        peerRef.current.ondatachannel = (event) => {
            sendChannel.current = event.channel;
            sendChannel.current.onmessage = handleReceiveMessage;
        };
        // ends here
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socket.current.id,
                sdp: peerRef.current.localDescription
            }
            socket.current.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    };

    // added for msg
    function handleChange(e) {
        setText(e.target.value);
    }

    // added for msg
    function sendMessage(e) {
        sendChannel.current.send(text);
        setMessage(message => [...message, { yours: true, value: text }]);
        setText("");
    }

    // function screenShare() {
    //     //function allows toshare screen with the partner user basically swaps out the current video track
    //     //with the the screen track
    //     navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
    //         const screenTrack = stream.getTracks()[0];
    //         senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
    //         screenTrack.onended = function() {
    //             senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
    //         }
    //     })
    // }

    // added for msg
    function renderMessage(message, index) {
        if (message.value != "") {
            if (message.yours) {
                window.scrollTo(0,5000);
                return (
                    <MyRow key={index}>
                        <MyMessage>
                            {message.value}
                        </MyMessage>
                    </MyRow>
                )
            }
            else {
                return (
                    <PartnerRow key={index}>
                        <PartnerMessage>
                            {message.value}
                        </PartnerMessage>
                    </PartnerRow>
                )
            }
        }
    }

    function copyUrl() {
        copy(window.location.href);
    }

    let UserVideo;
    if (stream) {
        UserVideo = (
            <div className="my-video">
                <Video playsInline muted ref={userVideo} autoPlay />
            </div>
        );
    }

    let PartnerVideo;
    PartnerVideo = (
        <div className="friend-video"><Video playsInline ref={partnerVideo} autoPlay /></div>
    );

    function muteUnmute() {
        if (isMuted) {
            setMuted(false);
            userVideo.current.srcObject.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
        }
        else {
            setMuted(true);
            userVideo.current.srcObject.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
        }
    }

    function pauseVideo() {
        if (!isPlaying && stream) {
            setPlaying(true);
            userVideo.current.srcObject.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
            UserVideo = (
                <div className="my-video">
                    <Video playsInline muted={isMuted} ref={userVideo} autoPlay />
                </div>
            );
        }
        else if (isPlaying && stream) {
            setPlaying(false);
            userVideo.current.srcObject.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
            UserVideo = (
                <div className="my-video">
                    <Video playsInline muted={isMuted} ref={userVideo} autoPlay />
                </div>
            );
        }
    }
    // this works, don't touch it
    function leaveCall() {
        socket.current.destroy();
        userStream.current.getVideoTracks()[0].enabled = false;
        userStream.current.getAudioTracks()[0].enabled = false;
        // userStream.current.destroy();
        window.location.replace("/");
    }

    return (
        <div className="main">
            <div className={chatShow ? "leftHide" : "leftVis"}>
                <Container>
                    {UserVideo}
                    {PartnerVideo}
                </Container>
                <footer className="footer page-footer footer-copyright font-small fixed-bottom text-center py-3 special-color pt-4">
                    <div className="call-action">
                        <button className="btn-circle" title="copy URL" onClick={copyUrl}><FontAwesomeIcon icon="clipboard" /></button>
                        <button onClick={muteUnmute} title="audio" className={isMuted ? "btn-mute" : "btn-unmute"}>
                            <FontAwesomeIcon icon={isMuted ? 'microphone-slash' : 'microphone'} />
                        </button>
                        <button className={isPlaying ? "btn-video-on" : "btn-video-off"} title="video" onClick={pauseVideo}>
                            <FontAwesomeIcon icon={isPlaying ? 'eye' : 'eye-slash'} />
                        </button>
                        <button title="leave" className="leave btn-circle" onClick={leaveCall} >
                            <FontAwesomeIcon icon="phone-slash" />
                        </button>
                        <button title="chat" onClick={toggleChat} className="btn-circle"><FontAwesomeIcon icon="comment-alt" /></button>
                        {/* <button onClick={shareScreen}>share</button> */}
                    </div>
                </footer>
            </div>
            <div className={chatShow ? "chatVis" : "chatHide"}>
                <div className="main__header">
                    <h6>In-call messages</h6>
                </div>
                <div className="chat-area">
                    <Message>
                        {message.map(renderMessage)}
                    </Message>
                </div>
                <div className="text-area">
                    <div><MessageBox className="textBox" value={text} onChange={handleChange} placeholder="Enter msg here..." />
                    <button className="send" onClick={sendMessage}><FontAwesomeIcon icon="paper-plane" /></button></div>
                </div>
            </div>
        </div>
    );
};

export default Room;