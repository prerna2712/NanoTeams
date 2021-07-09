import React from "react";
import { v1 as uuid } from "uuid";
import ParticlesBg from "particles-bg";
import Fade from "react-reveal";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Icons/App.scss';

const CreateRoom = (props) => {
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
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
                        </Fade>
                    </div>
                </div>
            </header>
    );
}

export default CreateRoom;