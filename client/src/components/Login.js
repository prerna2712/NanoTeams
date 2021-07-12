import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert, Carousel } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import P1 from './images/pic1.png';
import P2 from './images/pic2.png';
import P3 from './images/pic3.png';

export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      history.push("/create")
    } catch {
      setError("Failed to log in")
    }

    setLoading(false)
  }

  return (
    <div className="auth">
      <Carousel className="hero">
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src = "https://drive.google.com/drive/u/0/folders/1meVO_yxbjw-4936etLW4XS59e_NrJOXm"
            src={P1}
            alt="First slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src="https://cdn.pixabay.com/photo/2014/02/27/16/10/tree-276014__340.jpg"
            src={P2}
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src="https://cdn.pixabay.com/photo/2014/02/27/16/10/tree-276014__340.jpg"
            src={P3}
            alt="Third slide"
          />
        </Carousel.Item>
      </Carousel>
      <Card className="login-card">
        <Card.Body>
          <h2 className="text-center mb-4 heading"><span className="L">L</span>OGIN</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <br />
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} placeholder="Email" required />
            </Form.Group>
            <br/>
            <Button disabled={loading} className="w-100" type="submit">
              Log In
            </Button>
            <div className="w-100 text-center mt-2">
              Need an account? <Link to="/signup" className="L">Sign Up</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>

    </div>
  )
}
