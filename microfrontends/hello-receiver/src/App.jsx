import { useEffect, useState } from 'react'
import { mediatorInstance } from '@entando/mfecommunication'

let instances = 0

export default function App({ config }) {
  const [received, setReceived] = useState()
  const page = config.contextParams?.page_code ?? 'unknown' // "contextParams" in entando.json

  // Subscribe to the "hello" event of hello-sender; unsubscribe when the element leaves the page.
  useEffect(() => {
    const callerId = `hello-receiver-${++instances}` // one subscriber for each element on the page
    mediatorInstance.subscribe('hello', { callerId, callback: (data) => setReceived(data.text) })
    return () => mediatorInstance.unsubscribe('hello', callerId)
  }, [])

  // React writes text, never HTML: what another MFE sends cannot become code on our page.
  return <p>{received === undefined ? `Waiting for a message on page ${page}` : `Received: ${received}`}</p>
}
