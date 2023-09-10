import 'bootstrap/dist/css/bootstrap.min.css'
import { FormEvent, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Form } from 'react-bootstrap'

function App() {
  const [message, setMessage] = useState('')
  const handleClickStart = (e: FormEvent) => {
    chrome.runtime.sendMessage({ name: 'start', message: message })
  }
  const handleClickStop = (e: FormEvent) => {
    chrome.runtime.sendMessage({ name: 'stop' })
  }

  return (
    <main>
      {/* <textarea name="" id="" cols="30" rows="10" resize="none"></textarea> */}
      <Form.Control
        as="textarea"
        placeholder="Leave a comment here"
        cols={30}
        rows={10}
        onChange={(e) => {
          setMessage(e.target.value)
        }}
      ></Form.Control>
      <Button variant="primary" type="button" onClick={handleClickStart}>
        START
      </Button>
      <Button variant="danger" type="button" onClick={handleClickStop}>
        STOP
      </Button>
    </main>
  )
}

export default App
