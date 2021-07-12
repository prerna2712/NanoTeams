import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert, Carousel } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import P1 from './images/pic1.png';
import P2 from './images/pic2.png';
import P3 from './images/pic3.png';

export default function Signup() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    try {
      setError("")
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      history.push("/")
    } catch {
      setError("Failed to create an account")
    }

    setLoading(false)
  }

  return (
    <div className="auth">
      <Carousel className="hero">
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src="https://cdn.dribbble.com/users/77598/screenshots/12114194/media/109a0cb9c3b1532699f6a591c6476474.png?compress=1&resize=1000x750"
            src = {P1}
            alt="First slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src="https://cdn.pixabay.com/photo/2014/02/27/16/10/tree-276014__340.jpg"
            src = {P2}
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            // src="https://cdn.pixabay.com/photo/2014/02/27/16/10/tree-276014__340.jpg"
            src = {P3}
            alt="Third slide"
          />
        </Carousel.Item>
      </Carousel>
      <Card className="signup-card">
        <Card.Body>
          <h2 className="text-center mb-4 heading"><span className="L">S</span>IGNUP</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <br/>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
              <div style={{color: "gray"}}>*should be 8 char long and contain a num and special-symbol</div>
            </Form.Group>
            <br/>
            <Form.Group id="password-confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <br />
            <Button disabled={loading} className="w-100" type="submit">
              Sign Up
            </Button>
          </Form>
          <div className="w-100 text-center mt-2 ">
            Already have an account? <Link to="/login" className="L">Log In</Link>
          </div>
        </Card.Body>
      </Card>

    </div>
  )
}
