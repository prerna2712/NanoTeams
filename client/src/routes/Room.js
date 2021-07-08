import React, { useRef, useEffect, useState } from "react";
import './Icons';
import io from "socket.io-client";
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const Room = (props) => {
    const [isMuted, setMuted] = useState(false);
    const [isPlaying, setPlaying] = useState(true);
    const [stream, setStream] = useState();

    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socket = useRef();
    const otherUser = useRef();
    const userStream = useRef();

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
        });

    }, []);

    function callUser(userID) {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
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

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
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

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    };


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
        <div>
            <Container>
                {UserVideo}
                {PartnerVideo}
            </Container>
            <footer className="footer page-footer footer-copyright font-small fixed-bottom text-center py-3 special-color pt-4">
                <div className="call-action">
                    {/* {incomingCall} */}
                    <button onClick={muteUnmute} className={isMuted ? "btn-mute" : "btn-unmute"}>
                        <FontAwesomeIcon icon={isMuted ? 'microphone-slash' : 'microphone'} />
                    </button>
                    <button className={isPlaying ? "btn-video-on" : "btn-video-off"} onClick={pauseVideo}>
                        <FontAwesomeIcon icon={isPlaying ? 'eye' : 'eye-slash'} />
                    </button>
                    <button className="leave btn-circle" onClick={leaveCall} >
                        <FontAwesomeIcon icon="phone-slash" />
                    </button>
                    {/* <button onClick={shareScreen}>share</button> */}
                </div>
            </footer>
        </div>
    );
};

export default Room;