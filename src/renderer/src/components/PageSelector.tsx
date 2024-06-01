import { JSX, ReactElement } from 'react'
import Form from 'react-bootstrap/Form'

function PageSelector({
  pageNb,
  curPage,
  onChangePage
}: {
  pageNb: number
  curPage: number
  onChangePage: (v: number) => void
}): JSX.Element {
  const options: ReactElement[] = []
  for (let i = 0; i <= pageNb; ++i) {
    if (i === 0) {
      options.push(
        <option key={0} value={0} disabled={true}>
          Select Page
        </option>
      )
    } else {
      options.push(
        <option key={i} value={i}>
          {i}/{pageNb}
        </option>
      )
    }
  }

  return (
    <Form.Select
      value={curPage + 1}
      onChange={(e) => {
        onChangePage(parseInt(e.target.value, 10))
      }}
    >
      {options}
    </Form.Select>
  )
}

export default PageSelector
