import { useEffect, useState } from 'react'
import { mediatorInstance } from '@entando/mfecommunication'
import styles from './hello-receiver.css?inline' // the CSS as text, to put inside the shadow root

let instances = 0

// The address of a file from public/. Entando serves the files of each widget under its own base path,
// so an absolute path like "/mailbox.svg" would point to the site root, not to our widget.
function assetUrl(file) {
  const basePath = window.entando?.widgets?.['hello-receiver']?.basePath ?? ''
  return `${basePath.replace(/\/$/, '')}/${file}`
}

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
  return (
    <>
      <style>{styles}</style>
      <div className="card" part="card">
        <img src={assetUrl('mailbox.svg')} alt="Mailbox" />
        <p>{received === undefined ? `Waiting for a message on page ${page}` : `Received: ${received}`}</p>
      </div>
    </>
  )
}
