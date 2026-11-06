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

// Asks hello-ms for the secret and returns the text to show.
// The button is visible to everyone: hello-ms decides who may read the secret, and we only show its answer.
async function readSecret(config) {
  const apiUrl = config.systemParams?.api?.['hello-api']?.url // "apiClaims" in entando.json
  const keycloak = window.entando?.keycloak
  if (!apiUrl || !keycloak?.authenticated || !keycloak.token) {
    return 'Guest user' // nobody signed in: we don't even ask
  }
  try {
    await keycloak.updateToken?.(30) // a token lasts a few minutes: renew it if it expires within 30 seconds
    const response = await fetch(`${apiUrl}/api/secret`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }, // the token proves who we are
    })
    if (response.status === 200) {
      return (await response.json()).message
    }
    if (response.status === 403) {
      return 'No permission' // signed in, but without the role hello-user
    }
    return 'Guest user' // 401: hello-ms did not accept the token (expired, fake...)
  } catch {
    return 'Guest user' // network error, or Keycloak could not renew the token
  }
}

export default function App({ config }) {
  const [received, setReceived] = useState()
  const [secret, setSecret] = useState('')
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
      <div className="secret" part="secret">
        <button type="button" onClick={async () => setSecret(await readSecret(config))}>Read the secret</button>
        <span>{secret}</span>
      </div>
    </>
  )
}
