import React from "react";
import ParticlesBg from "particles-bg";
import Fade from "react-reveal";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = (props) => {

    return (
        <div>
            <header id="home">
                <ParticlesBg type="circle" bg={true} color={"random"} />
                <div className="banner">
                    <div className="col">
                        <Fade bottom>
                            <h1 className="responsive-headline">Nano-Teams</h1>
                            <h3>A video calling app. Create a room and share the link with your friend and connect realtime.</h3>
                            <br />
                            <Link to='/login' className="link"><button className="button-logs">Login</button></Link>
                            <Link to="/signup" className="link"><button className="button-logs btn-sgn" >Signup</button></Link>
                        </Fade>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Home;