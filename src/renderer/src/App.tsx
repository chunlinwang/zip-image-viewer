import { useState, JSX } from 'react'
import PageSelector from './components/PageSelector'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Image from 'react-bootstrap/Image'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Alert from 'react-bootstrap/Alert'
import { ExtractedImage } from '../../utils/interface'
import Versions from './components/Versions'

function App(): JSX.Element {
  const [files, setFiles] = useState<ExtractedImage[]>([])
  const [pageNb, setPageNb] = useState(0)
  const [curPage, setCurPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [noImage, setNoImage] = useState(false)
  const [zoom, setZoom] = useState(100)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function openFile(): Promise<void> {
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const data = await window.api.open('showOpenDialog', {
      title: 'Select a file',
      buttonLabel: 'This one will do',
      properties: ['openFile'],
      filters: [{ name: 'Archived File', extensions: ['zip'] }]
    })

    setFiles(data)
    setPageNb(data.length)
    setLoading(false)
    setNoImage(data.length === 0)
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

  return (
    <>
      <Versions></Versions>
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
                Init
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
    </>
  )
}

export default App
