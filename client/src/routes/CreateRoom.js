import React, {useState} from "react";
import { v1 as uuid } from "uuid";
import ParticlesBg from "particles-bg";
import Fade from "react-reveal";
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";

const MessageBox = styled.textarea`
    backgroud-color: white;
    width: 20vw;
    height: 100%;
`;

const CreateRoom = (props) => {
    const [text, setText] = useState("");
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    function handleChange(e) {
        setText(e.target.value);
    }

    function join (roomID) {
        if(text!=="")props.history.push(`/room/${text}`)
    }

    return (
            <header id="home">
                <ParticlesBg type="circle" bg={true} color={"random"} />
                <div className="banner">
                    <div className="col">
                        <Fade bottom>
                            <h1 className="responsive-headline">Nano-Teams</h1>
                            <h3>A video calling app. Create a room and share the link with your friend and connect realtime.</h3>
                            <br />
                            <button className="button" onClick={create}>Create Room</button>
                            or <br/>
                            <MessageBox className="textBox" value={text} onChange={handleChange} placeholder="Enter room ID" />
                            <button className="button" onClick={join}>Join Room</button>
                        </Fade>
                    </div>
                </div>
            </header>
    );
}

export default CreateRoom;