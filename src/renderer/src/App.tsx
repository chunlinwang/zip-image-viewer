import { useState, JSX } from 'react'
import PageSelector from './components/PageSelector'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Image from 'react-bootstrap/Image'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

import { ExtractedImage } from '../../utils/interface'

function App(): JSX.Element {
  const [files, setFiles] = useState<ExtractedImage[]>([])
  const [pageNb, setPageNb] = useState(0)
  const [filePath, setFilePath] = useState<string | null>(null)
  const [curPage, setCurPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [noImage, setNoImage] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [form, setForm] = useState<HTMLFormElement>(null)

  async function openFile(): Promise<void> {
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const path = await window.api.open('showOpenDialog', {
      title: 'Select a file',
      buttonLabel: 'Open File',
      properties: ['openFile'],
      filters: [{ name: 'Archived File', extensions: ['zip'] }]
    })

    if (path) {
      setFilePath(path)

      await readFile(path)
    } else {
      setLoading(false)
    }
  }

  async function readFile(path): Promise<void> {
    setLoading(true)

    try {
      if (path) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const data = await window.api.read(path, password)
        setFiles(data)
        setPageNb(data.length)
        setLoading(false)
        setNoImage(data.length === 0)
      }
    } catch (e) {
      if (e === 'ADM-ZIP: Wrong Password') {
        setShowPasswordModal(true)
        if (form instanceof HTMLFormElement) {
          form.reset()
        }
      }
    }
  }

  function changePage(page: number): void {
    setCurPage(page)
  }

  function init(): void {
    setPageNb(0)
    setCurPage(0)
    setFiles([])
    setNoImage(false)
    setZoom(100)
  }

  function next(): void {
    if (curPage === pageNb - 1) {
      return
    }

    setCurPage(() => curPage + 1)
  }

  function zoomIn(): void {
    setZoom(() => zoom + 10)
  }

  function zoomOut(): void {
    setZoom(() => zoom - 10)
  }

  function zoomReset(): void {
    setZoom(100)
  }

  async function handlePasswordSubmit(e): Promise<void> {
    e.preventDefault()
    if (password) {
      setShowPasswordModal(false)
      await readFile(filePath)
    }
  }

  function handlePassword(e): void {
    setPassword(e.target.value)
  }

  return (
    <>
      <Row>
        <ButtonToolbar aria-label="Toolbar with Button groups">
          <ButtonGroup className="me-2" aria-label="First group">
            {!loading && (
              <Button variant="primary" onClick={openFile}>
                Open File
              </Button>
            )}
            {pageNb > 0 && (
              <Button variant="primary" onClick={init}>
                INIT
              </Button>
            )}
          </ButtonGroup>
          <ButtonGroup className="me-2" aria-label="First group">
            {pageNb > 0 && (
              <Button variant="primary" onClick={zoomIn}>
                Zoom In
              </Button>
            )}
            {pageNb > 0 && (
              <Button variant="primary" onClick={zoomReset}>
                Zoom Reset
              </Button>
            )}
            {pageNb > 0 && (
              <Button variant="primary" onClick={zoomOut}>
                Zoom Out
              </Button>
            )}
          </ButtonGroup>
        </ButtonToolbar>
      </Row>
      <Row>{loading && <Spinner animation="border" />}</Row>
      <Row>{noImage && <Alert variant="danger">No image in the zip file</Alert>}</Row>
      {pageNb > 0 && files[curPage] && (
        <PageSelector pageNb={pageNb} curPage={curPage} onChangePage={changePage}></PageSelector>
      )}
      {pageNb > 0 && files[curPage] && (
        <Image
          style={{ zoom: `${zoom}%` }}
          onMouseDown={next}
          src={`data:image/${files[curPage].extension === 'png' ? 'png' : 'jpeg'};base64, ${files[curPage].data}`}
          alt={files[curPage].name}
        ></Image>
      )}
      <div>
        <Modal
          show={showPasswordModal}
          onHide={() => {
            setLoading(false)
            setShowPasswordModal(false)
          }}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header closeButton>
            <Modal.Title className={'form-text'}>Password ?</Modal.Title>
          </Modal.Header>

          <Form
            noValidate
            onSubmit={handlePasswordSubmit}
            ref={(el: HTMLFormElement) => {
              setForm(el)
            }}
          >
            <Modal.Body>
              <Form.Label className={'form-text'} htmlFor="inputPassword5">
                <Alert variant="danger">Password is Wrong</Alert>
              </Form.Label>
              <Form.Control
                type="password"
                id="password"
                aria-describedby="passwordHelpBlock"
                onChange={handlePassword}
              />
              <Form.Text id="passwordHelpBlock" muted>
                This is a encrypted file, Please put the password.
              </Form.Text>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  )
}

export default App
