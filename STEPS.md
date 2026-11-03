# Hello Bundle — step-by-step guide

Entando 7.5 for beginners. You need no programming experience: every step tells you exactly
what to type or copy, and what you should see.

## Before you start

### What you will build

```
  web page:   <hello-sender>  ── "hello" event ──▶  <hello-receiver>
                    │
                    │ asks for a message (HTTP)
                    ▼
  server:       hello-ms   (answers on /api/hello)
```

- **hello-sender** and **hello-receiver** are *micro frontends* (MFEs): small pieces of a web page.
- **hello-ms** is a *microservice*: a small program on a server that answers requests.
- **hello-sender-config** (step 18) is the settings form of hello-sender.

### Words you will meet

| Word | Meaning |
|---|---|
| Bundle | The package that holds all the parts of an Entando project. Entando installs bundles. |
| PBC | Packaged Business Capability: Entando's name for a bundle that solves one business need. |
| Micro frontend (MFE) | A piece of a web page that works on its own. Entando places it on pages as a *widget*. |
| Custom element | An HTML tag that we invent, like `<hello-sender>`. Each MFE is one custom element. |
| React | A JavaScript library that draws a piece of page from data, and draws it again when the data change. |
| Microservice (MS) | A small server program with one job. Ours answers with a greeting. |
| REST endpoint | A web address of the microservice that answers with data, for example `/api/hello`. |
| JSON | The text format for the data: `{"message": "Hello"}`. |
| Terminal | The window where you type commands. On Windows: Ubuntu in WSL 2, or *Git Bash* (see [`STEPS-WINDOWS.html`](STEPS-WINDOWS.html)). |
| Git | The tool that saves every version of the project. Each step is saved with a *tag*. |
| Branch | Your own line of saved versions (*commits*) in git. You save each step on it. |

### Tools to install

**On Windows**, first follow [`STEPS-WINDOWS.html`](STEPS-WINDOWS.html): it tells you what to install and
what changes in a few steps.

Open a terminal and check that each command prints a version:

```bash
ent version        # Entando command line, version 7.5
java -version      # Java 17
mvn -v             # Maven 3.6.3 or newer: builds the microservice
node -v            # Node.js 20.19 or newer: builds the micro frontends (Vite needs it)
docker ps          # Docker: runs the local database and Keycloak
```

### Get the project

```bash
git clone --branch beginner-version https://github.com/entando-samples/basic-training-bundle.git hello-bundle
cd hello-bundle
```

`git clone` downloads the project into the folder `hello-bundle`. Open that folder in your editor
(for example Visual Studio Code). All commands in this guide are typed **inside that folder**.

### How every step works

1. **Start** from our version of the previous step. The step's **Start:** line names its tag:

   ```bash
   git checkout -f beginner-step-NN    # NN = the number of the previous step
   ```

   `git checkout` replaces the files with the saved version. `-f` throws away what you changed
   before, so everybody starts the step from the same files. A message about "detached HEAD" is normal.
2. **Do** what the step says: edit or create the files. You can copy the code from this guide.
3. **Check** your work against our version of the step:

   ```bash
   git add -A                          # tell git to look at all your files
   git diff beginner-step-NN           # NN = the number of this step
   ```

   No output means that your files are exactly like ours. Lines starting with `-` are in our
   version and not in yours; lines starting with `+` are in yours and not in ours.
   Small differences in wording are fine.

**Stuck?** Take our finished step: `git checkout -f beginner-step-NN` (NN = this step).

### Keep your work: your own branch

Your goal is a working bundle, saved in git on your computer. `git checkout -f` puts you on a tag, not
on a branch (that is the "detached HEAD"), and the next `git checkout -f` throws your files away.
To keep your work, do every step on your own *branch*: a line of saved versions that is only yours.

Create it once, before step 1:

```bash
git switch -c my-bundle beginner-step-00   # new branch "my-bundle", starting from the empty project
```

Then do every step like this:

1. **Start:** you are already where your previous step ended, so you do not need the tag on the step's
   **Start:** line: do only the rest of that line, for example starting hello-ms.
   `git status` must say `On branch my-bundle` and `nothing to commit`.
2. **Do** the step.
3. **Check** your work: `git add -A`, then `git diff beginner-step-NN` (NN = this step).
4. **Save** the step on your branch:

   ```bash
   git add -A
   git commit -m "Step NN"              # NN = the number of this step
   ```

**Stuck?** Put our finished step on your branch, then go on with the next step:

```bash
git reset --hard beginner-step-NN      # NN = this step. It throws away what you did not commit
```

**Starting later?** If you join at step NN, create the branch from the step before it:
`git switch -c my-bundle beginner-step-MM` (MM = NN - 1).

At the end, `git log --oneline` lists your steps: the last commit on `my-bundle` is your working bundle.
If you closed the terminal or checked out a tag, go back to your branch with `git switch my-bundle`.

### Two commands you will use often

Both use `ent bundle run <name>`, always typed in the main folder of the project. It runs the `run` command
that `entando.json` gives to that part of the bundle, inside the part's own folder.

- **Open the local test page of a micro frontend** (from step 6). Every micro frontend has its own
  `index.html` in its own folder: you build it, test it and deploy it on its own, without the others.
  For hello-sender, in a second terminal:

  ```bash
  ent bundle run hello-sender
  ```

  Its `run` command builds the widget and serves its folder: open <http://localhost:5000> in the browser.
  Type `localhost`, not the `127.0.0.1` address that the command prints: from step 13, hello-ms answers only
  pages on `localhost`, and on `127.0.0.1` hello-sender says *The microservice is not reachable.*
  The others work the same way: `ent bundle run hello-receiver` (from step 7) opens on <http://localhost:5173>
  and rebuilds the page every time you save a file; `ent bundle run hello-sender-config` (from step 18) opens
  on <http://localhost:5001>. Stop each one with `Ctrl+C`.
- **Start the microservice** (from step 10). In another terminal:

  ```bash
  ent bundle run hello-ms
  ```

  `entando.json` gives hello-ms no `run` command, so Entando uses the default one of a Spring Boot
  microservice: `mvn spring-boot:run`. Wait for the line `Started HelloApplication`. Stop it with `Ctrl+C`.

---

## Step 1 — Start a PBC project from scratch

**Goal:** give the bundle a name and write down the plan, before any code.

**Start:** the empty project created by `ent bundle init hello-bundle` (tag `beginner-step-00`).

1. Open `entando.json`, the *bundle descriptor*: the file that tells Entando what is inside the bundle.
   - Change `description` to `Hello Bundle: Entando 7.5 training for beginners`.
   - Add the line `"displayName": "Hello Bundle"` (the name shown in Entando's App Builder).
   - Change `version` to `0.0.2`. **Every step raises the version**, so each new package has its own number.
   - Do not change `name`: it is the technical name used everywhere, and it never changes.

   ```json
   {
       "microservices": [],
       "microfrontends": [],
       "svc": [],
       "name": "hello-bundle",
       "version": "0.0.2",
       "description": "Hello Bundle: Entando 7.5 training for beginners",
       "type": "bundle",
       "displayName": "Hello Bundle"
   }
   ```
2. Create the file `README.md` with the plan of the project:

   ````markdown
   # Hello Bundle — Entando 7.5 for beginners

   A small training project: two micro frontends talk to each other and to one microservice.
   The course guide is [STEPS.md](STEPS.md): one section for each of the 21 steps.

   Repository: <https://github.com/entando-samples/basic-training-bundle>

   ```
   git clone --branch beginner-version https://github.com/entando-samples/basic-training-bundle.git hello-bundle
   ```

   | Part | Folder | What it does |
   |---|---|---|
   | hello-ms | `microservices/hello-ms` | Microservice: answers on `/api/hello` with a small JSON message |
   | hello-sender | `microfrontends/hello-sender` | Micro frontend: shows the answer and sends it to the receiver |
   | hello-receiver | `microfrontends/hello-receiver` | Micro frontend: shows what the sender sent |
   | hello-sender-config | `microfrontends/hello-sender-config` | Settings form for hello-sender in App Builder |

   Every step is saved in git with a tag: `beginner-step-01` … `beginner-step-21`.
   From step 20 the address `/api/secret` answers only to signed-in users; everything else is public.
   From step 21 hello-receiver calls it with the token of the signed-in user.
   ````

**What you should see:** `ent bundle info` prints `hello-bundle` and version `0.0.2`.

**Check:** `git add -A` then `git diff beginner-step-01`

## Step 2 — LAB Review: bundle structure

**Goal:** know what each folder of a bundle is for, and check the bundle without a server.

**Start:** step 1 finished (tag `beginner-step-01`)

1. Look at the folders:

   | Folder | Contains | Created by |
   |---|---|---|
   | `microfrontends/` | one folder per micro frontend | `ent bundle mfe add` |
   | `microservices/` | one folder per microservice | `ent bundle ms add` |
   | `svc/` | local helper services (database, Keycloak) | `ent bundle svc enable` |
   | `platform/` | optional pages and page parts | you |
   | `.entando/` | files of the `ent` tool (not saved in git) | `ent` |
2. Change `version` in `entando.json` to `0.0.3`.
3. Check the bundle. This prepares the package without building any image (replace `my-org` with your Docker Hub user name):

   ```bash
   ent bundle info
   ent bundle pack --skip-docker-build --org my-org
   ```

**What you should see:** the pack ends without errors and creates `.entando/output/descriptors/descriptor.yaml`,
the file that Entando reads. `git status` shows no new files: `.entando/` is ignored by git.

**Check:** `git add -A` then `git diff beginner-step-02`

## Step 3 — Deploy the bundle to your platform

**Goal:** put the bundle on a real Entando server. Your trainer gives you access to it.

**Start:** step 2 finished (tag `beginner-step-02`)

1. Change `version` in `entando.json` to `0.0.4`.
2. Connect `ent` to your Entando server and to Docker Hub (your trainer gives you the file and the account):

   ```bash
   ent attach-kubeconfig path/to/the/kubeconfig/file
   docker login
   ```
3. Run the four commands, one at a time. Each one does one job:

   ```bash
   ent bundle pack --org my-org      # build the package (a Docker image tagged with the version)
   ent bundle publish --org my-org   # upload it to Docker Hub
   ent bundle deploy                 # show it in the Hub of your Entando server
   ent bundle install                # install it
   ```

   If the bundle is already installed, add `--conflict-strategy=OVERRIDE` to `ent bundle install`.

**What you should see:** in App Builder, open **Hub**: *Hello Bundle* is listed as installed.
It contains nothing yet; from step 6 it will contain our widgets.

**Check:** `git add -A` then `git diff beginner-step-03`

## Step 4 — What a micro frontend is

**Goal:** understand the parts we will build.

**Start:** step 3 finished (tag `beginner-step-03`)

1. Read:
   - A **micro frontend** is a custom HTML element. The browser shows `<hello-sender>` the way it shows
     `<p>` or `<button>`, because our JavaScript file explains what `<hello-sender>` looks like.
   - Entando calls it a **widget**: in App Builder you drag it onto a page.
   - Our two widgets **never call each other directly**. They talk through *events* (step 7) and they get
     data from the microservice (step 13).
2. Change `version` in `entando.json` to `0.0.5`.

**Check:** `git add -A` then `git diff beginner-step-04`

## Step 5 — LAB Explanation: the micro frontend contract

**Goal:** know what Entando gives to each widget.

**Start:** step 4 finished (tag `beginner-step-04`)

1. Read: Entando writes a `config` attribute on each widget. Its value is JSON text with three parts:

   ```html
   <hello-sender config='{"systemParams": {...}, "params": {...}, "contextParams": {...}}'></hello-sender>
   ```

   | Part | What it holds | Step |
   |---|---|---|
   | `systemParams.api` | the address of the microservice (*API claim*) | 13 |
   | `contextParams` | facts about the page, for example its code | 15 |
   | `params` | the settings chosen in App Builder | 18 |

   All values are text. Our test page writes this attribute by hand; on Entando the platform writes it.
2. Change `version` in `entando.json` to `0.0.6`.

**Check:** `git add -A` then `git diff beginner-step-05`

## Step 6 — Create a micro frontend: hello-sender

**Goal:** create the first widget and see it in the browser.

**Start:** step 5 finished (tag `beginner-step-05`)

1. Add the micro frontend to the bundle:

   ```bash
   ent bundle mfe add hello-sender --stack=custom
   ```

   `--stack=custom` means plain JavaScript, with no framework. The command adds an entry to `entando.json`.
2. In `entando.json`, edit the new entry: set the titles and the three `commands`. A command is what Entando
   runs to prepare the widget: `build` and `pack` just copy our file into the `build` folder; `run` (used by
   `ent bundle run hello-sender`) also serves the folder of the widget on port 5000, to test it on your computer.

   ```json
   {
       "name": "hello-sender",
       "customElement": "hello-sender",
       "stack": "custom",
       "type": "widget",
       "group": "free",
       "publicFolder": "public",
       "titles": {
           "en": "Hello Sender",
           "it": "Hello Sender"
       },
       "commands": {
           "build": "mkdir -p build && cp src/hello-sender.js build/",
           "run": "mkdir -p build && cp src/hello-sender.js build/ && npx --yes http-server . -p 5000 -c-1",
           "pack": "mkdir -p build && cp src/hello-sender.js build/"
       },
       "version": "0.1.0"
   }
   ```

   Also change the bundle `version` to `0.1.0` (a new feature raises the middle number).
3. Create `microfrontends/hello-sender/src/hello-sender.js`:

   ```javascript
   // hello-sender: our first micro frontend (MFE).
   // An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
   class HelloSender extends HTMLElement {
     // The browser calls connectedCallback when the element appears on the page.
     connectedCallback() {
       this.innerHTML = '<p>Hello from the sender!</p>';
     }
   }

   customElements.define('hello-sender', HelloSender);
   ```
4. Create the local test page `microfrontends/hello-sender/index.html`, in the folder of the widget.
   Entando does not use it (it loads only the file in `build/`): it lets you run the widget **alone**.
   Every micro frontend gets its own test page, so each one has its own life: you build it, test it and
   deploy it without touching the others.

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-sender — local test page</title>
   </head>
   <body>
     <h1>hello-sender</h1>
     <hello-sender></hello-sender>

     <script src="build/hello-sender.js"></script>
   </body>
   </html>
   ```
5. Build the widget and open its test page:

   ```bash
   ent bundle run hello-sender
   ```

**What you should see:** at <http://localhost:5000> the page shows *Hello from the sender!*

**Check:** `git add -A` then `git diff beginner-step-06`

## Step 7 — Create a micro frontend: hello-receiver, and connect the two with events

**Goal:** the second widget receives a message from the first one through Entando's *MFE communication*.

**Start:** step 6 finished (tag `beginner-step-06`)

An **event** is a message with a name. hello-sender *publishes* the event `hello`; hello-receiver
*subscribes* to it. Entando's library `@entando/mfecommunication` delivers it. Its *mediator*
(`window.entando.globals.mediator`) is shared by all widgets on the page.

hello-sender stays plain JavaScript. hello-receiver is built like most real projects, and like the Entando guide
*Create a React micro frontend*: **React** draws the widget, and **Vite** builds the code into one file.
Entando does not mind: for a `custom` stack it only runs your `commands` and takes the file they produce.

1. Add the second micro frontend:

   ```bash
   ent bundle mfe add hello-receiver --stack=custom
   ```
2. Each widget needs the library. Create `microfrontends/hello-sender/package.json`:

   ```json
   {
     "name": "hello-sender",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "build": "mkdir -p build && cat node_modules/@entando/mfecommunication/dist/entando-mfecommunication.umd.cjs src/hello-sender.js > build/hello-sender.js"
     },
     "dependencies": {
       "@entando/mfecommunication": "1.0.12"
     }
   }
   ```

   `npm install` downloads the library into `node_modules`; `npm run build` joins the library and our file
   into one file in `build/`.
3. Create the React app of hello-receiver with Vite. We give the exact version of the tool, so everybody gets the
   same files:

   ```bash
   cd microfrontends
   npm create vite@9.3.4 hello-receiver -- --template react --no-interactive
   cd hello-receiver
   ```

   Vite creates a demo app. A widget needs only a part of it: remove the demo images, styles and notes,
   then add the library of the events:

   ```bash
   rm -r .gitignore .oxlintrc.json README.md public src/assets src/App.css src/index.css
   npm install @entando/mfecommunication@1.0.12
   cd ../..
   ```

   Five files remain: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx` and `src/App.jsx`.
   You replace the last four in the next points.
4. In `entando.json`, set the `commands` of **both** micro frontends, fill in the titles of hello-receiver,
   and change the bundle `version` to `0.2.0`. hello-receiver needs two more lines: `buildFolder`, because Vite writes
   into `dist/` instead of `build/`, and the `run` command, which starts Vite's development server:

   ```json
   {
       "name": "hello-sender",
       "customElement": "hello-sender",
       "stack": "custom",
       "type": "widget",
       "group": "free",
       "publicFolder": "public",
       "titles": {
           "en": "Hello Sender",
           "it": "Hello Sender"
       },
       "commands": {
           "build": "npm install && npm run build",
           "run": "npm install && npm run build && npx --yes http-server . -p 5000 -c-1",
           "pack": "npm install && npm run build"
       },
       "version": "0.1.0"
   },
   {
       "name": "hello-receiver",
       "customElement": "hello-receiver",
       "stack": "custom",
       "type": "widget",
       "group": "free",
       "publicFolder": "public",
       "titles": {
           "en": "Hello Receiver",
           "it": "Hello Receiver"
       },
       "buildFolder": "dist",
       "commands": {
           "build": "npm install && npm run build",
           "run": "npm install && npm run dev",
           "pack": "npm install && npm run build"
       },
       "version": "0.1.0"
   }
   ```
5. Replace `microfrontends/hello-sender/src/hello-sender.js` (it now has a button that publishes the event):

   ```javascript
   // hello-sender: our first micro frontend (MFE).
   // An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
   class HelloSender extends HTMLElement {
     // The browser calls connectedCallback when the element appears on the page.
     connectedCallback() {
       this.show('Hello from the sender!');
     }

     show(message) {
       this.innerHTML = '<p></p><button></button>';
       this.querySelector('p').textContent = message;
       this.querySelector('button').textContent = 'Send';
       // On click, publish a "hello" event: every MFE that subscribed to it gets the text.
       this.querySelector('button').onclick = () => {
         window.entando.globals.mediator.publish('hello', { text: message });
       };
     }
   }

   customElements.define('hello-sender', HelloSender);
   ```
6. Replace `microfrontends/hello-sender/index.html`. hello-receiver is not on this page, so the page plays its
   part: it subscribes to `hello` and shows what arrives:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-sender — local test page</title>
   </head>
   <body>
     <h1>hello-sender</h1>
     <hello-sender></hello-sender>

     <!-- hello-receiver is deployed on its own: here we play its part and show every "hello" event. -->
     <h2>Pretend to be hello-receiver</h2>
     <pre id="events">No "hello" event yet.</pre>

     <script src="build/hello-sender.js"></script>
     <script>
       window.entando.globals.mediator.subscribe('hello', {
         callerId: 'test-page',
         callback: (data) => { document.querySelector('#events').textContent = 'Received: ' + data.text; },
       });
     </script>
   </body>
   </html>
   ```
7. Replace `microfrontends/hello-receiver/vite.config.js`. Vite builds in *library mode*: one file,
   `dist/hello-receiver.js`, that defines the element. The `umd` format is a plain script wrapped in a function,
   so it runs as soon as Entando adds it to the page and leaves nothing behind in the page:

   ```javascript
   import react from '@vitejs/plugin-react'
   import { defineConfig } from 'vite'

   // hello-receiver is built in library mode: one JavaScript file that defines <hello-receiver>.
   // Entando loads that file on the page; index.html is only the local test page ("npm run dev").
   export default defineConfig(({ mode }) => ({
     plugins: [react()],
     // React reads process.env.NODE_ENV, which does not exist in the browser: Vite writes the value in.
     define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
     build: {
       lib: {
         entry: 'src/main.jsx',
         name: 'hello-receiver',
         formats: ['umd'], // a plain script, wrapped in a function: as in the Entando React tutorial
         fileName: () => 'hello-receiver.js',
       },
     },
   }))
   ```
8. Replace the code of hello-receiver. First `microfrontends/hello-receiver/src/main.jsx`, the custom element:
   it starts React when the element appears on the page and stops it when the element leaves:

   ```jsx
   // hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
   // The element is the contract with Entando; React draws what is inside it (src/App.jsx).
   import { createRoot } from 'react-dom/client'
   import App from './App.jsx'

   class HelloReceiver extends HTMLElement {
     // The browser calls connectedCallback when the element appears on the page: start React.
     connectedCallback() {
       this.root = createRoot(this)
       this.root.render(<App />)
     }

     // The browser calls disconnectedCallback when the element leaves the page: stop React.
     disconnectedCallback() {
       this.root.unmount()
     }
   }

   customElements.define('hello-receiver', HelloReceiver)
   ```

   Then `microfrontends/hello-receiver/src/App.jsx`, what React draws. `useEffect` subscribes to `hello` when the
   widget starts and returns the function that unsubscribes when it stops. `useState` keeps the last text received:
   when it changes, React draws the widget again.

   ```jsx
   import { useEffect, useState } from 'react'
   import { mediatorInstance } from '@entando/mfecommunication'

   let instances = 0

   export default function App() {
     const [received, setReceived] = useState()

     // Subscribe to the "hello" event of hello-sender; unsubscribe when the element leaves the page.
     useEffect(() => {
       const callerId = `hello-receiver-${++instances}` // one subscriber for each element on the page
       mediatorInstance.subscribe('hello', { callerId, callback: (data) => setReceived(data.text) })
       return () => mediatorInstance.unsubscribe('hello', callerId)
     }, [])

     // React writes text, never HTML: what another MFE sends cannot become code on our page.
     return <p>{received === undefined ? 'Waiting for a message...' : `Received: ${received}`}</p>
   }
   ```
9. Replace `microfrontends/hello-receiver/index.html`, the test page of hello-receiver. Vite serves it during
   development; it plays the part of hello-sender with a button that publishes `hello`:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-receiver — local test page</title>
   </head>
   <body>
     <h1>hello-receiver</h1>
     <hello-receiver></hello-receiver>

     <!-- hello-sender is deployed on its own: here we play its part and publish the "hello" event ourselves. -->
     <h2>Pretend to be hello-sender</h2>
     <input id="text" value="Hello from the test page!">
     <button id="send">Publish "hello"</button>
     <button id="toggle">Remove / add the receiver</button>

     <script type="module" src="/src/main.jsx"></script>
     <script type="module">
       import { mediatorInstance } from '@entando/mfecommunication';

       document.querySelector('#send').onclick = () =>
         mediatorInstance.publish('hello', { text: document.querySelector('#text').value });

       // Removing the element calls disconnectedCallback (unsubscribe); adding it back subscribes again.
       const receiver = document.querySelector('hello-receiver');
       document.querySelector('#toggle').onclick = () =>
         receiver.isConnected ? receiver.remove() : document.body.insertBefore(receiver, document.querySelector('h2'));
     </script>
   </body>
   </html>
   ```
10. In `.gitignore`, add the lines `**/dist` and `**/package-lock.json` under `**/build`
   (Vite and npm create them; we don't save them).
11. Open the two test pages, each in its own terminal (`run` builds the widget first):

    ```bash
    ent bundle run hello-sender
    ```

    ```bash
    ent bundle run hello-receiver
    ```

**What you should see:** at <http://localhost:5000>, click **Send**: the page shows *Received: Hello from the sender!*
At <http://localhost:5173>, the receiver shows *Waiting for a message...*; click **Publish "hello"**: it shows
*Received: Hello from the test page!* On Entando both widgets are on the same page and use the same mediator,
so the receiver shows what the sender sends.

**Check:** `git add -A` then `git diff beginner-step-07`

## Step 8 — LAB Review: test the widgets

**Goal:** check by hand that the widgets work, like a tester.

**Start:** step 7 finished (tag `beginner-step-07`), then open the two test pages: `ent bundle run hello-sender` and
`ent bundle run hello-receiver`, each in its own terminal.

1. Test these cases and write down the result:

   | Test | Expected |
   |---|---|
   | Open the hello-sender page (port 5000) | sender shows *Hello from the sender!*, the page shows *No "hello" event yet.* |
   | Click **Send** | the page shows *Received: Hello from the sender!* |
   | Open the hello-receiver page (port 5173) | receiver shows *Waiting for a message...* |
   | Click **Publish "hello"** | receiver shows *Received: Hello from the test page!* |
   | Press `F12`, open **Console**, type `window.entando.globals.mediator.publish('hello', {text: 'from the console'})` | receiver shows *Received: from the console* |
   | Click **Remove / add the receiver** twice, then **Publish "hello"** | the receiver still answers: it unsubscribed when it left the page and subscribed again when it came back |

   If the hello-receiver page shows only the titles and the buttons, `<hello-receiver>` was never registered:
   check that `microfrontends/hello-receiver/src/main.jsx` ends with `customElements.define` (step 7, point 8), then look for errors
   in the **Console**.
2. The console test shows that the receiver does not know who publishes: anyone can send a `hello` event.
3. Change `version` in `entando.json` to `0.2.1`.

**Check:** `git add -A` then `git diff beginner-step-08`

## Step 9 — LAB Explanation: the API contract

**Goal:** agree on what the microservice will answer, before writing it.

**Start:** step 8 finished (tag `beginner-step-08`)

1. Read the contract of hello-ms. An *API* is the list of addresses a program answers:

   | Method and address | Answer (JSON) | Who can call it |
   |---|---|---|
   | `GET /api/health` | `{"status": "UP"}` | everybody: Entando uses it to check that the service is alive |
   | `GET /api/hello` | `{"message": "Hello from hello-ms!"}` | everybody |
   | `GET /api/secret` (step 20) | `{"message": "Hello admin, only signed-in users can read this."}` | only signed-in users with the role `hello-user` |

   `GET` means "read". The answer comes with a *status code*: `200` = OK, `401` = you must sign in,
   `403` = you are signed in, but you do not have the role this address needs.

   hello-ms does not exist yet: here you only read what it will answer. Step 10 writes it and checks
   the first two addresses; step 20 checks the third.
2. Change `version` in `entando.json` to `0.2.2`.

**Check:** `git add -A` then `git diff beginner-step-09`

## Step 10 — Add a Spring Boot microservice

**Goal:** create hello-ms and call it from the browser.

**Start:** step 9 finished (tag `beginner-step-09`)

1. Add the microservice to the bundle:

   ```bash
   ent bundle ms add hello-ms --stack=spring-boot
   ```

   The entry in `entando.json` says that Entando checks `/api/health` to know that the service is alive.
   Change the bundle `version` to `0.3.0`.
2. Create these files in `microservices/hello-ms/`. **Spring Boot** is a Java framework that turns a few
   lines into a web server.
   - `microservices/hello-ms/pom.xml` — the Maven project: Java version and libraries. It is long, but you never need to change it by hand
     except to add a library.

     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <!-- Maven project file: the Java version, the libraries we use and how to build hello-ms.jar. -->
     <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
         <modelVersion>4.0.0</modelVersion>
         <parent>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-starter-parent</artifactId>
             <version>3.5.16</version>
             <relativePath/>
         </parent>
         <groupId>org.entando.hello</groupId>
         <artifactId>hello-ms</artifactId>
         <version>0.1.0</version>
         <properties>
             <java.version>17</java.version>
         </properties>
         <dependencies>
             <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
         </dependencies>
         <build>
             <finalName>hello-ms</finalName>
             <plugins>
                 <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
             </plugins>
         </build>
     </project>
     ```
   - `microservices/hello-ms/Dockerfile` — the recipe Entando uses to run the service in the cluster:

     ```dockerfile
     # Recipe for the container image that Entando runs in the cluster.
     FROM eclipse-temurin:17-jre
     WORKDIR /app
     COPY target/hello-ms.jar app.jar
     # Entando expects every microservice on port 8081.
     EXPOSE 8081
     ENTRYPOINT ["java", "-jar", "/app/app.jar"]
     ```
   - `microservices/hello-ms/src/main/resources/application.yml` — the settings:

     ```yaml
     server:
       port: 8081 # Entando expects every microservice on port 8081
     ```
   - `microservices/hello-ms/src/main/java/org/entando/hello/HelloApplication.java` — the start point:

     ```java
     package org.entando.hello;

     import org.springframework.boot.SpringApplication;
     import org.springframework.boot.autoconfigure.SpringBootApplication;

     // The start point of hello-ms: Spring Boot finds the other classes and starts a web server.
     @SpringBootApplication
     public class HelloApplication {

         public static void main(String[] args) {
             SpringApplication.run(HelloApplication.class, args);
         }
     }
     ```
   - `microservices/hello-ms/src/main/java/org/entando/hello/HelloController.java` — the two endpoints:

     ```java
     package org.entando.hello;

     import java.util.Map;
     import org.springframework.web.bind.annotation.CrossOrigin;
     import org.springframework.web.bind.annotation.GetMapping;
     import org.springframework.web.bind.annotation.RestController;

     // The REST endpoints of hello-ms: each method answers one web address with JSON.
     @RestController
     @CrossOrigin(originPatterns = "http://localhost:*") // lets the local test page call us
     public class HelloController {

         @GetMapping("/api/health")
         public Map<String, String> health() {
             return Map.of("status", "UP");
         }

         @GetMapping("/api/hello")
         public Map<String, String> hello() {
             return Map.of("message", "Hello from hello-ms!");
         }
     }
     ```
3. Start it: `ent bundle run hello-ms`. The first time Maven downloads the libraries: wait.

**What you should see:** open <http://localhost:8081/api/hello>: the browser shows `{"message":"Hello from hello-ms!"}`.
<http://localhost:8081/api/health> shows `{"status":"UP"}`.

**Check:** `git add -A` then `git diff beginner-step-10`

## Step 11 — LAB Review: backend tests

**Goal:** let the computer check the microservice for us, every time.

**Start:** step 10 finished (tag `beginner-step-10`)

A *test* is a small program that calls our code and checks the answer. If someone breaks
the endpoint later, the test fails and tells us.

1. In `microservices/hello-ms/pom.xml`, add the test library (`spring-boot-starter-test`): put this line
   inside `<dependencies>`, right after the `spring-boot-starter-web` line:

   ```xml
   <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
   ```

   Without it, `mvn test` stops with *package org.junit.jupiter.api does not exist*.
   The whole file is now:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!-- Maven project file: the Java version, the libraries we use and how to build hello-ms.jar. -->
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>3.5.16</version>
           <relativePath/>
       </parent>
       <groupId>org.entando.hello</groupId>
       <artifactId>hello-ms</artifactId>
       <version>0.1.0</version>
       <properties>
           <java.version>17</java.version>
       </properties>
       <dependencies>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
       </dependencies>
       <build>
           <finalName>hello-ms</finalName>
           <plugins>
               <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
           </plugins>
       </build>
   </project>
   ```
2. Create `microservices/hello-ms/src/test/java/org/entando/hello/HelloControllerTest.java`:

   ```java
   package org.entando.hello;

   import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
   import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

   import org.junit.jupiter.api.Test;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.test.web.servlet.MockMvc;

   // Automatic checks of hello-ms. Run them with: mvn test
   @SpringBootTest
   @AutoConfigureMockMvc
   class HelloControllerTest {

       @Autowired
       MockMvc mvc; // calls our endpoints without a real web server

       @Test
       void helloAnswersWithAMessage() throws Exception {
           mvc.perform(get("/api/hello"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello from hello-ms!"));
       }
   }
   ```
3. Run the tests: `cd microservices/hello-ms` then `mvn test`.
4. Try to break it: in `microservices/hello-ms/src/main/java/org/entando/hello/HelloController.java` change the message to `Hi`, run `mvn test` again and see it fail. Then change it back.
5. Change `version` in `entando.json` to `0.3.1`.

**What you should see:** `Tests run: 1, Failures: 0` and `BUILD SUCCESS`. With the wrong message: `BUILD FAILURE`.

**Check:** `git add -A` then `git diff beginner-step-11`

## Step 12 — LAB Explanation: API claims

**Goal:** understand how a widget finds the address of the microservice.

**Start:** step 11 finished (tag `beginner-step-11`)

1. Read: the address of hello-ms is different on your computer (`http://localhost:8081`) and on the
   Entando server (an address created at install time). So the widget must **never** contain the address.
   Instead, the widget declares an **API claim**: "I need the service hello-ms, and I call it `hello-api`".
   Entando then writes the real address into the widget's `config` attribute:

   ```json
   {"systemParams": {"api": {"hello-api": {"url": "https://your-server/hello-bundle-.../hello-ms"}}}}
   ```
2. On your computer, our test page writes `http://localhost:8081` there instead.
3. Change `version` in `entando.json` to `0.3.2`.

**Check:** `git add -A` then `git diff beginner-step-12`

## Step 13 — Connect them together with an API claim

**Goal:** hello-sender shows the message that comes from hello-ms.

**Start:** step 12 finished (tag `beginner-step-12`)

1. Declare the claim:

   ```bash
   ent bundle api add hello-sender hello-api --serviceName=hello-ms --serviceUrl=http://localhost:8081
   ```

   It adds `apiClaims` to hello-sender in `entando.json` and creates `microfrontends/hello-sender/public/mfe-config.json`
   with the local address. Change the bundle `version` to `0.4.0`.
2. Replace `microfrontends/hello-sender/src/hello-sender.js`. `fetch` asks the microservice for `/api/hello`;
   when the answer arrives, the widget shows it:

   ```javascript
   // hello-sender: our first micro frontend (MFE).
   // An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
   class HelloSender extends HTMLElement {
     // The browser calls connectedCallback when the element appears on the page.
     connectedCallback() {
       // Entando writes the widget settings into the "config" attribute, as JSON text.
       const config = JSON.parse(this.getAttribute('config'));
       // The API claim "hello-api" gives us the address of the microservice.
       const apiUrl = config.systemParams.api['hello-api'].url;
       this.innerHTML = '<p>Loading...</p>';
       fetch(apiUrl + '/api/hello')
         .then((response) => response.json())
         .then((data) => this.show(data.message))
         .catch(() => { this.innerHTML = '<p>The microservice is not reachable.</p>'; });
     }

     show(message) {
       this.innerHTML = '<p></p><button></button>';
       this.querySelector('p').textContent = message;
       this.querySelector('button').textContent = 'Send';
       // On click, publish a "hello" event: every MFE that subscribed to it gets the text.
       this.querySelector('button').onclick = () => {
         window.entando.globals.mediator.publish('hello', { text: message });
       };
     }
   }

   customElements.define('hello-sender', HelloSender);
   ```
3. In `microfrontends/hello-sender/index.html`, give hello-sender its `config` attribute, as Entando would:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-sender — local test page</title>
   </head>
   <body>
     <h1>hello-sender</h1>
     <!-- On Entando, the platform writes the config attribute. Here we write it by hand:
          the API claim "hello-api" points to hello-ms started with "ent bundle run hello-ms". -->
     <hello-sender config='{"systemParams":{"api":{"hello-api":{"url":"http://localhost:8081"}}}}'></hello-sender>

     <!-- hello-receiver is deployed on its own: here we play its part and show every "hello" event. -->
     <h2>Pretend to be hello-receiver</h2>
     <pre id="events">No "hello" event yet.</pre>

     <script src="build/hello-sender.js"></script>
     <script>
       window.entando.globals.mediator.subscribe('hello', {
         callerId: 'test-page',
         callback: (data) => { document.querySelector('#events').textContent = 'Received: ' + data.text; },
       });
     </script>
   </body>
   </html>
   ```
4. Start hello-ms (`ent bundle run hello-ms`) and, in another terminal, open the test page of hello-sender
   (`ent bundle run hello-sender`) at <http://localhost:5000>. Use `localhost`, not `127.0.0.1`:
   the line `@CrossOrigin(originPatterns = "http://localhost:*")` in
   `microservices/hello-ms/src/main/java/org/entando/hello/HelloController.java` lets only pages on `localhost`
   call hello-ms. For the browser `127.0.0.1` is another site, so the call is refused.

**What you should see:** the sender shows *Hello from hello-ms!*. Click **Send**: the page shows *Received: Hello from hello-ms!*

**Check:** `git add -A` then `git diff beginner-step-13`

## Step 14 — LAB Review: check the HTTP calls

**Goal:** see the request travel from the browser to the microservice, and what happens when it fails.

**Start:** step 13 finished (tag `beginner-step-13`), then start hello-ms, build the widgets and open the test page of hello-sender.

1. Press `F12`, open the **Network** tab and reload the page. Click the line `hello`:
   - **Request URL:** `http://localhost:8081/api/hello`
   - **Status:** `200`
   - **Response:** `{"message":"Hello from hello-ms!"}`
2. Stop hello-ms (`Ctrl+C`) and reload: the sender shows *The microservice is not reachable.*
   A good widget always tells the user when something goes wrong.
3. Change `version` in `entando.json` to `0.4.1`.

**Check:** `git add -A` then `git diff beginner-step-14`

## Step 15 — Add context parameters to a micro frontend

**Goal:** hello-receiver shows on which page it is placed.

**Start:** step 14 finished (tag `beginner-step-14`)

1. In `entando.json`, ask Entando for the page code: add `"contextParams": ["page_code"]` to hello-receiver,
   and change the bundle `version` to `0.5.0`:

   ```json
   {
       "name": "hello-receiver",
       "customElement": "hello-receiver",
       "stack": "custom",
       "type": "widget",
       "group": "free",
       "publicFolder": "public",
       "titles": {
           "en": "Hello Receiver",
           "it": "Hello Receiver"
       },
       "buildFolder": "dist",
       "commands": {
           "build": "npm install && npm run build",
           "run": "npm install && npm run dev",
           "pack": "npm install && npm run build"
       },
       "version": "0.1.0",
       "contextParams": [
           "page_code"
       ]
   }
   ```
2. Replace `microfrontends/hello-receiver/src/main.jsx`. The element now reads the page code from `config` and
   gives it to React. `attributeChangedCallback` draws again when `config` changes, without reloading the page
   (`observedAttributes` lists the attributes to watch):

   ```jsx
   // hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
   // The element is the contract with Entando; React draws what is inside it (src/App.jsx).
   import { createRoot } from 'react-dom/client'
   import App from './App.jsx'

   class HelloReceiver extends HTMLElement {
     // Entando writes the settings of the widget into the "config" attribute: we watch it.
     static observedAttributes = ['config']

     // The browser calls connectedCallback when the element appears on the page: start React.
     connectedCallback() {
       this.root = createRoot(this)
       this.render()
     }

     // The browser calls disconnectedCallback when the element leaves the page: stop React.
     disconnectedCallback() {
       this.root.unmount()
       this.root = null
     }

     // The browser calls attributeChangedCallback when "config" changes: draw again with the new value.
     attributeChangedCallback() {
       this.render()
     }

     render() {
       const config = JSON.parse(this.getAttribute('config') || '{}') // the attribute is text: read it as JSON
       this.root?.render(<App config={config} />) // no root yet = not on the page yet
     }
   }

   customElements.define('hello-receiver', HelloReceiver)
   ```
3. Replace `microfrontends/hello-receiver/src/App.jsx`. React receives `config` as a *prop* (an input of the
   component) and shows the page code while it waits:

   ```jsx
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
   ```
4. In `microfrontends/hello-receiver/index.html`, give hello-receiver its `config` attribute:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-receiver — local test page</title>
   </head>
   <body>
     <h1>hello-receiver</h1>
     <!-- On Entando, the platform writes the config attribute. Here we write it by hand. -->
     <hello-receiver config='{"contextParams":{"page_code":"homepage"}}'></hello-receiver>

     <!-- hello-sender is deployed on its own: here we play its part and publish the "hello" event ourselves. -->
     <h2>Pretend to be hello-sender</h2>
     <input id="text" value="Hello from the test page!">
     <button id="send">Publish "hello"</button>
     <button id="toggle">Remove / add the receiver</button>

     <script type="module" src="/src/main.jsx"></script>
     <script type="module">
       import { mediatorInstance } from '@entando/mfecommunication';

       document.querySelector('#send').onclick = () =>
         mediatorInstance.publish('hello', { text: document.querySelector('#text').value });

       // Removing the element calls disconnectedCallback (unsubscribe); adding it back subscribes again.
       const receiver = document.querySelector('hello-receiver');
       document.querySelector('#toggle').onclick = () =>
         receiver.isConnected ? receiver.remove() : document.body.insertBefore(receiver, document.querySelector('h2'));
     </script>
   </body>
   </html>
   ```

**What you should see:** on the test page of hello-receiver, *Waiting for a message on page homepage*. On Entando it shows the code of the real page.

**Check:** `git add -A` then `git diff beginner-step-15`

## Step 16 — Web components and CSS isolation with shadow DOM

**Goal:** protect hello-receiver from the styles of the page it lives on, and show an image that travels with the widget.

**Start:** step 15 finished (tag `beginner-step-15`)

*CSS* is the language of styles (colours, sizes). A page on Entando has its own CSS, which can change
how our widget looks. A **shadow root** is a private area inside the element: page styles stay out,
and our styles stay in.

A widget can also bring its own files, such as images. Files in `public/` are copied by Vite next to
`hello-receiver.js`. Do not use an absolute address like `/mailbox.svg`: on Entando it points to the root of the
site, not to your widget. Build the address from the **base path** that Entando publishes for every widget in
`window.entando.widgets` (see *Serve static assets* in the Entando guide *Create a React micro frontend*).

1. Create `microfrontends/hello-receiver/src/hello-receiver.css`, the styles of the widget:

   ```css
   /* These styles live inside the shadow root: page styles can't change them, and they can't leak out. */
   :host {
     display: block;
     font-family: system-ui, sans-serif;
   }

   .card {
     display: flex;
     align-items: center;
     gap: 12px;
     padding: 12px 16px;
     border: 1px solid #b7d7b7;
     border-radius: 8px;
     background: #f3faf3;
   }

   img {
     width: 48px;
     height: 48px;
     flex: none;
   }

   p {
     margin: 0;
     color: darkgreen;
     font-weight: bold;
   }
   ```
2. Create the image `microfrontends/hello-receiver/public/mailbox.svg` (any small image works, with this name):

   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Mailbox">
     <rect x="6" y="22" width="40" height="30" rx="8" fill="#2e7d32"/>
     <rect x="12" y="28" width="28" height="18" rx="4" fill="#e8f5e9"/>
     <rect x="46" y="34" width="4" height="26" fill="#5d4037"/>
     <rect x="46" y="10" width="3" height="16" fill="#c62828"/>
     <rect x="49" y="10" width="11" height="8" fill="#c62828"/>
     <path d="M14 30l12 8 12-8" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linejoin="round"/>
   </svg>
   ```
3. In `microfrontends/hello-receiver/src/main.jsx`, start React inside a shadow root instead of the element itself.
   `attachShadow` creates it the first time; when the element comes back on the page, we reuse it:

   ```jsx
     connectedCallback() {
       // A shadow root is a private area of the page: page styles cannot reach it, ours cannot leak out.
       this.root = createRoot(this.shadowRoot ?? this.attachShadow({ mode: 'open' }))
       this.render()
     }
   ```
4. Replace `microfrontends/hello-receiver/src/App.jsx`. `import styles from './hello-receiver.css?inline'` gives the
   CSS as text, to put in a `<style>` inside the shadow root. `assetUrl` builds the address of the image.
   Vite copies the files of `public/` to `dist/` next to `hello-receiver.js`: it is its default, nothing to configure.

   ```jsx
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
   ```
5. In `microfrontends/hello-receiver/index.html`, add a page style inside `<head>` that makes every paragraph red,
   and a paragraph to see it:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-receiver — local test page</title>
     <!-- A page style that would make every paragraph red: the shadow DOM protects the receiver from it. -->
     <style>p { color: red; }</style>
   </head>
   <body>
     <h1>hello-receiver</h1>
     <p>This paragraph is red; the receiver below stays green.</p>

     <!-- On Entando, the platform writes the config attribute. Here we write it by hand. -->
     <hello-receiver config='{"contextParams":{"page_code":"homepage"}}'></hello-receiver>

     <!-- hello-sender is deployed on its own: here we play its part and publish the "hello" event ourselves. -->
     <h2>Pretend to be hello-sender</h2>
     <input id="text" value="Hello from the test page!">
     <button id="send">Publish "hello"</button>
     <button id="toggle">Remove / add the receiver</button>

     <script type="module" src="/src/main.jsx"></script>
     <script type="module">
       import { mediatorInstance } from '@entando/mfecommunication';

       document.querySelector('#send').onclick = () =>
         mediatorInstance.publish('hello', { text: document.querySelector('#text').value });

       // Removing the element calls disconnectedCallback (unsubscribe); adding it back subscribes again.
       const receiver = document.querySelector('hello-receiver');
       document.querySelector('#toggle').onclick = () =>
         receiver.isConnected ? receiver.remove() : document.body.insertBefore(receiver, document.querySelector('h2'));
     </script>
   </body>
   </html>
   ```
6. Change `version` in `entando.json` to `0.5.1` and open the test page of hello-receiver.

**What you should see:** the page paragraph is **red**; the receiver text stays **dark green and bold**, in a
green box with the mailbox image. Press `F12` → **Elements**: inside `<hello-receiver>` you see `#shadow-root (open)`,
and the `<img>` points to `/mailbox.svg`. On Entando the address starts with the base path of the widget.
Run `npm run build` in `microfrontends/hello-receiver`: `dist/` contains `hello-receiver.js` and `mailbox.svg`.

**Check:** `git add -A` then `git diff beginner-step-16`

## Step 17 — Add a self-provisioned database to the microservice

**Goal:** hello-ms counts the visits and keeps the count in a PostgreSQL database that Entando creates for it.

**Start:** step 16 finished (tag `beginner-step-16`)

1. Ask for the database and get a local copy of it:

   ```bash
   ent bundle svc enable postgresql
   ```

   This adds `postgresql` to `svc` in `entando.json` and creates `svc/postgresql.yml` (a local PostgreSQL in Docker).
2. In `entando.json`, add `"dbms": "postgresql"` to hello-ms: on the server, Entando creates the database for it.
   Change the bundle `version` to `0.6.0`.

   ```json
   {
       "name": "hello-ms",
       "stack": "spring-boot",
       "healthCheckPath": "/api/health",
       "dbms": "postgresql"
   }
   ```
3. Replace `microservices/hello-ms/pom.xml`: it adds two libraries, `spring-boot-starter-jdbc` (talks SQL, the database language) and `postgresql` (talks to PostgreSQL):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!-- Maven project file: the Java version, the libraries we use and how to build hello-ms.jar. -->
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>3.5.16</version>
           <relativePath/>
       </parent>
       <groupId>org.entando.hello</groupId>
       <artifactId>hello-ms</artifactId>
       <version>0.1.0</version>
       <properties>
           <java.version>17</java.version>
       </properties>
       <dependencies>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-jdbc</artifactId></dependency>
           <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
       </dependencies>
       <build>
           <finalName>hello-ms</finalName>
           <plugins>
               <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
           </plugins>
       </build>
   </project>
   ```
4. Replace `microservices/hello-ms/src/main/resources/application.yml`:

   ```yaml
   server:
     port: 8081 # Entando expects every microservice on port 8081

   spring:
     datasource:
       # The local database started with "ent bundle svc start postgresql".
       # On Entando, the platform creates the database and replaces these three values.
       url: jdbc:postgresql://localhost:5432/hello-bundle
       username: hello-bundle-user
       password: hello-bundle-password
   ```
5. Replace `microservices/hello-ms/src/main/java/org/entando/hello/HelloController.java`. It creates the table `visits` once, adds one row per call and counts the rows:

   ```java
   package org.entando.hello;

   import java.util.Map;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.web.bind.annotation.CrossOrigin;
   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RestController;

   // The REST endpoints of hello-ms: each method answers one web address with JSON.
   @RestController
   @CrossOrigin(originPatterns = "http://localhost:*") // lets the local test page call us
   public class HelloController {

       private final JdbcTemplate database;

       public HelloController(JdbcTemplate database) {
           this.database = database;
           database.execute("CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY)");
       }

       @GetMapping("/api/health")
       public Map<String, String> health() {
           return Map.of("status", "UP");
       }

       @GetMapping("/api/hello")
       public Map<String, Object> hello() {
           database.update("INSERT INTO visits DEFAULT VALUES");
           Integer visits = database.queryForObject("SELECT COUNT(*) FROM visits", Integer.class);
           return Map.of("message", "Hello from hello-ms!", "visits", visits);
       }
   }
   ```
6. Replace `microservices/hello-ms/src/test/java/org/entando/hello/HelloControllerTest.java`: the test uses a fake database.

   ```java
   package org.entando.hello;

   import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
   import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
   import static org.mockito.Mockito.*;

   import org.junit.jupiter.api.Test;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.test.context.bean.override.mockito.MockitoBean;
   import org.springframework.test.web.servlet.MockMvc;

   // Automatic checks of hello-ms. Run them with: mvn test
   @SpringBootTest
   @AutoConfigureMockMvc
   class HelloControllerTest {

       @Autowired
       MockMvc mvc; // calls our endpoints without a real web server

       @MockitoBean
       JdbcTemplate database; // a fake database, so the tests don't need PostgreSQL

       @Test
       void helloAnswersWithAMessage() throws Exception {
           when(database.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
           mvc.perform(get("/api/hello"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello from hello-ms!"));
       }
   }
   ```
7. hello-sender shows the count: in `microfrontends/hello-sender/src/hello-sender.js` change the line `.then((data) => this.show(data.message))` to:

   ```javascript
      .then((data) => this.show(data.message + ' Visits: ' + data.visits))
   ```
8. Start the database, then the microservice:

   ```bash
   ent bundle svc start postgresql
   ent bundle build hello-ms && ent bundle run hello-ms
   ```

   Wait for the line `Started HelloApplication`, then reload the test page of hello-sender
   (`ent bundle run hello-sender`, <http://localhost:5000>). If it says *The microservice is not reachable.*,
   check that the address is `localhost`, not `127.0.0.1`; otherwise hello-ms was not ready yet: reload again.

**What you should see:** every reload of the test page of hello-sender shows a higher number: *Hello from hello-ms! Visits: 3*.
Stop and restart hello-ms: the count continues, because it is saved in the database.

**Check:** `git add -A` then `git diff beginner-step-17`

## Step 18 — Add configuration to your micro frontend

**Goal:** in App Builder, the person who builds the page chooses the text of hello-sender's button.

**Start:** step 17 finished (tag `beginner-step-17`)

A widget's settings are called **params**. Entando shows them in a settings form, and that form is itself a
small micro frontend of type `widget-config`: hello-sender-config.

1. Add the settings form:

   ```bash
   ent bundle mfe add hello-sender-config --stack=custom --type=widget-config
   ```
2. In `entando.json`, declare the param `buttonText` on hello-sender and link the form with `configMfe`;
   set the commands of hello-sender-config; change the bundle `version` to `0.7.0`:

   ```json
   {
       "name": "hello-sender",
       "customElement": "hello-sender",
       "stack": "custom",
       "type": "widget",
       "group": "free",
       "publicFolder": "public",
       "titles": {
           "en": "Hello Sender",
           "it": "Hello Sender"
       },
       "commands": {
           "build": "npm install && npm run build",
           "run": "npm install && npm run build && npx --yes http-server . -p 5000 -c-1",
           "pack": "npm install && npm run build"
       },
       "version": "0.1.0",
       "apiClaims": [
           {
               "name": "hello-api",
               "type": "internal",
               "serviceName": "hello-ms"
           }
       ],
       "params": [
           {
               "name": "buttonText",
               "description": "Text of the send button. Default: Send"
           }
       ],
       "configMfe": "hello-sender-config"
   },
   {
       "name": "hello-sender-config",
       "customElement": "hello-sender-config",
       "stack": "custom",
       "type": "widget-config",
       "group": "free",
       "publicFolder": "public",
       "commands": {
           "build": "mkdir -p build && cp src/hello-sender-config.js build/",
           "run": "mkdir -p build && cp src/hello-sender-config.js build/ && npx --yes http-server . -p 5001 -c-1",
           "pack": "mkdir -p build && cp src/hello-sender-config.js build/"
       },
       "version": "0.1.0"
   }
   ```
3. Create `microfrontends/hello-sender-config/src/hello-sender-config.js`. App Builder *writes* `config` when the
   form opens and *reads* it when you click Save:

   ```javascript
   // hello-sender-config: the settings form that App Builder shows for the hello-sender widget.
   class HelloSenderConfig extends HTMLElement {
     connectedCallback() {
       this.innerHTML = '<label>Button text: <input></label>';
       this.querySelector('input').value = this.buttonText || '';
     }

     // App Builder writes "config" when the form opens: the settings saved last time.
     set config(value) {
       this.buttonText = (value && value.buttonText) || '';
       const input = this.querySelector('input');
       if (input) input.value = this.buttonText;
     }

     // App Builder reads "config" when you click Save: we return what the user typed.
     get config() {
       const input = this.querySelector('input');
       return { buttonText: input ? input.value : this.buttonText || '' };
     }
   }

   customElements.define('hello-sender-config', HelloSenderConfig);
   ```
4. hello-sender uses the setting. Replace `microfrontends/hello-sender/src/hello-sender.js`:

   ```javascript
   // hello-sender: our first micro frontend (MFE).
   // An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
   class HelloSender extends HTMLElement {
     // The browser calls connectedCallback when the element appears on the page.
     connectedCallback() {
       // Entando writes the widget settings into the "config" attribute, as JSON text.
       const config = JSON.parse(this.getAttribute('config'));
       this.buttonText = config.params.buttonText || 'Send';
       // The API claim "hello-api" gives us the address of the microservice.
       const apiUrl = config.systemParams.api['hello-api'].url;
       this.innerHTML = '<p>Loading...</p>';
       fetch(apiUrl + '/api/hello')
         .then((response) => response.json())
         .then((data) => this.show(data.message + ' Visits: ' + data.visits))
         .catch(() => { this.innerHTML = '<p>The microservice is not reachable.</p>'; });
     }

     show(message) {
       this.innerHTML = '<p></p><button></button>';
       this.querySelector('p').textContent = message;
       this.querySelector('button').textContent = this.buttonText;
       // On click, publish a "hello" event: every MFE that subscribed to it gets the text.
       this.querySelector('button').onclick = () => {
         window.entando.globals.mediator.publish('hello', { text: message });
       };
     }
   }

   customElements.define('hello-sender', HelloSender);
   ```
5. In `microfrontends/hello-sender/index.html`, pass `params` to hello-sender, as Entando would:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-sender — local test page</title>
   </head>
   <body>
     <h1>hello-sender</h1>
     <!-- On Entando, the platform writes the config attribute. Here we write it by hand:
          the API claim "hello-api" points to hello-ms started with "ent bundle run hello-ms". -->
     <hello-sender config='{"systemParams":{"api":{"hello-api":{"url":"http://localhost:8081"}}},"params":{"buttonText":"Say hello"}}'></hello-sender>

     <!-- hello-receiver is deployed on its own: here we play its part and show every "hello" event. -->
     <h2>Pretend to be hello-receiver</h2>
     <pre id="events">No "hello" event yet.</pre>

     <script src="build/hello-sender.js"></script>
     <script>
       window.entando.globals.mediator.subscribe('hello', {
         callerId: 'test-page',
         callback: (data) => { document.querySelector('#events').textContent = 'Received: ' + data.text; },
       });
     </script>
   </body>
   </html>
   ```
6. Create `microfrontends/hello-sender-config/index.html`, the test page of the form. It does what App Builder does:
   it writes `config` when the form opens and reads it when you click **Save**:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-sender-config — local test page</title>
   </head>
   <body>
     <h1>Settings form of hello-sender (App Builder shows it)</h1>
     <hello-sender-config></hello-sender-config>
     <button id="save">Save</button>
     <pre id="saved"></pre>

     <script src="build/hello-sender-config.js"></script>
     <script>
       const form = document.querySelector('hello-sender-config');
       // App Builder writes the settings saved last time when the form opens...
       form.config = { buttonText: 'Say hello' };
       // ...and reads them back when you click Save.
       document.querySelector('#save').onclick = () => {
         document.querySelector('#saved').textContent = JSON.stringify(form.config);
       };
     </script>
   </body>
   </html>
   ```
7. Start everything and open the two test pages.

   Start the parts in this order. Type every command in the main folder of the bundle, and give
   each `ent bundle run` its own terminal: it keeps running until you press `Ctrl+C`.

   1. The database. It starts in the background, so this terminal stays free:

      ```bash
      ent bundle svc start postgresql
      ```
   2. The microservice. Wait for the line `Started HelloApplication` before going on:

      ```bash
      ent bundle run hello-ms
      ```
   3. The test page of hello-sender, then open <http://localhost:5000>:

      ```bash
      ent bundle run hello-sender
      ```
   4. The test page of hello-sender-config, then open <http://localhost:5001>:

      ```bash
      ent bundle run hello-sender-config
      ```

   Why this order: hello-ms keeps the visits in the database (step 17), so the database comes first.
   hello-sender asks hello-ms for the message as soon as its page opens, and it shows the button only when
   hello-ms answers: without hello-ms you see *The microservice is not reachable.* and no button.
   hello-sender-config calls nobody, so it works even alone. hello-receiver is not needed in this step.
   If the database and hello-ms are still running from step 17, leave them on and start only 3 and 4.

**What you should see:** at <http://localhost:5000> the button reads **Say hello**. At <http://localhost:5001>
the form shows *Say hello*; type *Hi!* and click **Save**:
`{"buttonText":"Hi!"}` appears, exactly what App Builder would store. On Entando: drag *Hello Sender* onto a
page, open its settings, type a text, save and publish the page.

**Check:** `git add -A` then `git diff beginner-step-18`

## Step 19 — LAB Review: check everything before adding security

**Goal:** write down how the service behaves now, so that after step 20 we can see exactly what changed.

**Start:** step 18 finished (tag `beginner-step-18`), then start the database and hello-ms.

1. Run each command and write the status code (the number after `HTTP/1.1`):

   ```bash
   curl -i http://localhost:8081/api/health
   curl -i http://localhost:8081/api/hello
   curl -i http://localhost:8081/api/secret
   ```

   `curl` calls a web address from the terminal; `-i` shows the status code too.

   | Address | Now (step 19) | After step 20 |
   |---|---|---|
   | `/api/health` | `200` | `200` |
   | `/api/hello` | `200` | `200` |
   | `/api/secret` | `404` (it does not exist yet) | `401` without sign-in, `403` signed in without the role `hello-user`, `200` with the role |
2. Change `version` in `entando.json` to `0.7.1`.

**Check:** `git add -A` then `git diff beginner-step-19`

## Step 20 — Protect the MFE–MS communication

**Goal:** add a REST endpoint that answers **only to signed-in users with the right role**, and prove that it is really protected.

**Start:** step 19 finished (tag `beginner-step-19`)

Anyone on the internet can call a public address. Data that belongs to users must be protected
**in the microservice**: hiding a button in the web page is not enough, because anyone can call the address
with `curl`. Entando uses **Keycloak** to sign users in. Keycloak gives a signed-in user a **token**:
a long text, signed by Keycloak, that proves who the user is. The microservice checks the signature
of the token on every call.

Protecting an endpoint takes two checks, done by the microservice on every call:

| Check | Question | If the answer is no |
|---|---|---|
| **Authentication** | Is there a valid token, signed by our Keycloak and not expired? | `401 Unauthorized` |
| **Authorization** | Does the user have the **role** that this endpoint needs? | `403 Forbidden` |

How hello-ms checks a token, step by step:

1. The caller (the micro frontend, or `curl`) sends the token in the header `Authorization: Bearer <token>`.
2. hello-ms is a **resource server**: it does not sign anybody in, it only reads tokens. At startup it asks Keycloak
   for its public keys (from the `issuer-uri` you set in `application.yml`) and uses them to check the signature
   of every token, its expiry time (`exp`) and who issued it (`iss`). A token that fails one check gets `401`.
3. Keycloak writes the user's **client roles** into the token, grouped by the Keycloak **client** that owns them:

   ```json
   "resource_access": { "internal": { "roles": ["hello-user"] } }
   ```

   hello-ms turns the roles of **its own client** into Spring Security *authorities*, and `@PreAuthorize`
   allows the call only if the needed authority is there. Otherwise the answer is `403`.

On Entando you declare the roles of a microservice in `entando.json`: when the bundle is installed, Entando
creates a Keycloak client for the microservice (named like `pn-<id>-hello-ms`), adds the roles to it and gives
the microservice the client name. Locally, the test Keycloak has no such client, so we use its `internal` client.
We use a **client role**, not a realm role: a realm role such as `ROLE_ADMIN` is shared by every application
in the realm, while a client role belongs only to hello-ms.

1. Get a local Keycloak:

   ```bash
   ent bundle svc enable keycloak
   ```

   This adds `keycloak` to `svc` in `entando.json` and creates `svc/keycloak.yml` and the folder `svc/keycloak/`
   with a test user `admin` (password `admin`). Change the bundle `version` to `1.0.0`:
   the first complete version.
2. In `entando.json`, add the role `hello-user` to the `hello-ms` entry of `microservices`.
   Entando creates it in Keycloak when you install the bundle:

   ```json
   {
       "name": "hello-ms",
       "stack": "spring-boot",
       "healthCheckPath": "/api/health",
       "dbms": "postgresql",
       "roles": [
           "hello-user"
       ]
   }
   ```
3. Replace `microservices/hello-ms/pom.xml`: it adds `spring-boot-starter-oauth2-resource-server`, the library that checks tokens, and its test helper `spring-security-test`:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!-- Maven project file: the Java version, the libraries we use and how to build hello-ms.jar. -->
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>3.5.16</version>
           <relativePath/>
       </parent>
       <groupId>org.entando.hello</groupId>
       <artifactId>hello-ms</artifactId>
       <version>0.1.0</version>
       <properties>
           <java.version>17</java.version>
       </properties>
       <dependencies>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-jdbc</artifactId></dependency>
           <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-oauth2-resource-server</artifactId></dependency>
           <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
           <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
       </dependencies>
       <build>
           <finalName>hello-ms</finalName>
           <plugins>
               <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
           </plugins>
       </build>
   </project>
   ```
4. In `microservices/hello-ms/src/main/resources/application.yml`, tell hello-ms which Keycloak signs the tokens and which Keycloak client holds its roles
   (on Entando, the platform gives the real values):

   ```yaml
   server:
     port: 8081 # Entando expects every microservice on port 8081

   spring:
     datasource:
       # The local database started with "ent bundle svc start postgresql".
       # On Entando, the platform creates the database and replaces these three values.
       url: jdbc:postgresql://localhost:5432/hello-bundle
       username: hello-bundle-user
       password: hello-bundle-password
     security:
       oauth2:
         resourceserver:
           jwt:
             # The Keycloak server that signs the tokens. Locally: "ent bundle svc start keycloak".
             issuer-uri: ${KEYCLOAK_AUTH_URL:http://localhost:9080/auth}/realms/${KEYCLOAK_REALM:entando-dev}

   hello:
     keycloak:
       # The Keycloak client that holds the roles of hello-ms ("roles" in entando.json).
       # Locally: the "internal" client of the test Keycloak. On Entando, the platform creates
       # a client for hello-ms and passes its name in the variable KEYCLOAK_CLIENT_ID.
       client-id: ${KEYCLOAK_CLIENT_ID:internal}
   ```

   `${KEYCLOAK_CLIENT_ID:internal}` means: the value of the variable `KEYCLOAK_CLIENT_ID` if it exists, else `internal`.
5. Create `microservices/hello-ms/src/main/java/org/entando/hello/SecurityConfig.java`, the rules. `@EnableMethodSecurity` turns on `@PreAuthorize`,
   and the converter reads the Keycloak roles from the token:

   ```java
   package org.entando.hello;

   import java.util.ArrayList;
   import java.util.Collection;
   import java.util.List;
   import java.util.Map;
   import org.springframework.beans.factory.annotation.Value;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
   import org.springframework.security.config.annotation.web.builders.HttpSecurity;
   import org.springframework.security.core.GrantedAuthority;
   import org.springframework.security.core.authority.SimpleGrantedAuthority;
   import org.springframework.security.oauth2.jwt.Jwt;
   import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
   import org.springframework.security.web.SecurityFilterChain;

   // The security rules of hello-ms: which web addresses need a signed-in user, and which roles.
   @Configuration
   @EnableMethodSecurity // turns on @PreAuthorize in the controllers
   public class SecurityConfig {

       @Bean
       SecurityFilterChain rules(HttpSecurity http, JwtAuthenticationConverter keycloakRoles) throws Exception {
           http.authorizeHttpRequests(auth -> auth
                   .requestMatchers("/api/secret").authenticated() // needs a valid Keycloak token
                   .anyRequest().permitAll()) // everything else stays public
               // Accept tokens (JWT) only if Keycloak signed them: see issuer-uri in application.yml.
               // The converter turns the Keycloak roles of the token into Spring authorities.
               .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakRoles)));
           return http.build();
       }

       // Keycloak writes the client roles of the user into the token, under the client that owns them:
       //   "resource_access": { "internal": { "roles": ["hello-user"] } }
       // Spring Security does not read this claim by itself: here we turn each role into an authority.
       @Bean
       JwtAuthenticationConverter keycloakRoles(@Value("${hello.keycloak.client-id}") String clientId) {
           JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
           converter.setJwtGrantedAuthoritiesConverter(token -> clientRoles(token, clientId));
           return converter;
       }

       // Reads only the roles of our own client: a role with the same name on another client does not count.
       static Collection<GrantedAuthority> clientRoles(Jwt token, String clientId) {
           Map<String, Object> resourceAccess = token.getClaimAsMap("resource_access");
           if (resourceAccess == null || !(resourceAccess.get(clientId) instanceof Map<?, ?> client)) {
               return List.of(); // no roles for our client in this token
           }
           List<GrantedAuthority> authorities = new ArrayList<>();
           if (client.get("roles") instanceof Collection<?> roles) {
               for (Object role : roles) {
                   authorities.add(new SimpleGrantedAuthority(role.toString()));
               }
           }
           return authorities;
       }
   }
   ```
6. Replace `microservices/hello-ms/src/main/java/org/entando/hello/HelloController.java` (new endpoint `/api/secret`, which needs the role `hello-user` and reads the user name from the token):

   ```java
   package org.entando.hello;

   import java.util.Map;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.security.access.prepost.PreAuthorize;
   import org.springframework.security.core.annotation.AuthenticationPrincipal;
   import org.springframework.security.oauth2.jwt.Jwt;
   import org.springframework.web.bind.annotation.CrossOrigin;
   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RestController;

   // The REST endpoints of hello-ms: each method answers one web address with JSON.
   @RestController
   @CrossOrigin(originPatterns = "http://localhost:*") // lets the local test page call us
   public class HelloController {

       private final JdbcTemplate database;

       public HelloController(JdbcTemplate database) {
           this.database = database;
           database.execute("CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY)");
       }

       @GetMapping("/api/health")
       public Map<String, String> health() {
           return Map.of("status", "UP");
       }

       @GetMapping("/api/hello")
       public Map<String, Object> hello() {
           database.update("INSERT INTO visits DEFAULT VALUES");
           Integer visits = database.queryForObject("SELECT COUNT(*) FROM visits", Integer.class);
           return Map.of("message", "Hello from hello-ms!", "visits", visits);
       }

       @GetMapping("/api/secret")
       @PreAuthorize("hasAuthority('hello-user')") // signed in AND with the role hello-user, else 403
       public Map<String, String> secret(@AuthenticationPrincipal Jwt token) {
           String user = token.getClaimAsString("preferred_username");
           return Map.of("message", "Hello " + user + ", only signed-in users can read this.");
       }
   }
   ```
7. Replace `microservices/hello-ms/src/test/java/org/entando/hello/HelloControllerTest.java` (new test: without a token 401, without the role 403, with the role 200):

   ```java
   package org.entando.hello;

   import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
   import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
   import static org.mockito.Mockito.*;
   import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

   import java.util.List;
   import java.util.Map;
   import org.junit.jupiter.api.Test;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.test.context.bean.override.mockito.MockitoBean;
   import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
   import org.springframework.test.web.servlet.MockMvc;

   // Automatic checks of hello-ms. Run them with: mvn test
   @SpringBootTest
   @AutoConfigureMockMvc
   class HelloControllerTest {

       @Autowired
       MockMvc mvc; // calls our endpoints without a real web server

       @MockitoBean
       JdbcTemplate database; // a fake database, so the tests don't need PostgreSQL

       @Test
       void helloAnswersWithAMessage() throws Exception {
           when(database.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
           mvc.perform(get("/api/hello"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello from hello-ms!"));
       }

       @Test
       void secretNeedsAValidTokenAndTheHelloUserRole() throws Exception {
           // No token: 401 Unauthorized.
           mvc.perform(get("/api/secret")).andExpect(status().isUnauthorized());
           // A valid token, but without the role: 403 Forbidden.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of())))
               .andExpect(status().isForbidden());
           // The role on another client does not count: 403 Forbidden.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of("other-client", Map.of("roles", List.of("hello-user"))))))
               .andExpect(status().isForbidden());
           // A valid token with the role hello-user on our client: 200 OK.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of("internal", Map.of("roles", List.of("hello-user"))))))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello admin, only signed-in users can read this."));
       }

       // A fake Keycloak token for user "admin" with the given "resource_access" claim.
       // Its roles are read by the same code that hello-ms uses for the real tokens.
       private static JwtRequestPostProcessor keycloakToken(Map<String, Object> resourceAccess) {
           return jwt()
               .jwt(t -> t.claim("preferred_username", "admin").claim("resource_access", resourceAccess))
               .authorities(t -> SecurityConfig.clientRoles(t, "internal"));
       }
   }
   ```
8. Start everything (Keycloak needs about one minute the first time):

   ```bash
   ent bundle svc start postgresql keycloak
   ent bundle build hello-ms && ent bundle run hello-ms
   ```

   Keycloak is ready when <http://localhost:9080/auth/admin> opens. If it never opens and `docker ps` shows the
   Keycloak container *Restarting*, Keycloak cannot write its database: inside the container it runs as the
   user with id 1000, and on Linux the folder `svc/keycloak/keycloak-db/` belongs to you. If your id (`id -u`)
   is not 1000, let Keycloak write there, then start it again:

   ```bash
   ent bundle svc stop keycloak
   chmod 777 svc/keycloak/keycloak-db    # Keycloak keeps its database here
   ent bundle svc start keycloak
   ```
9. **Prepare Keycloak** — locally you do by hand what Entando does at install time. Open <http://localhost:9080/auth/admin>,
   sign in as `admin` / `admin` and choose the realm **entando-dev** (top left).
   - **Create the role:** *Clients* → `internal` → tab *Roles* → *Add Role* → name `hello-user` → *Save*.
   - **Allow `curl` to ask for a token:** *Clients* → `web_app` → tab *Settings* → turn on *Direct Access Grants Enabled* → *Save*.
     `web_app` is the client that the web pages use, so its tokens carry the client roles of the user.
     In the browser Entando signs users in through the Keycloak login page; this switch is only for testing with `curl`.
10. **Without a token** — in another terminal:

    ```bash
    curl -i http://localhost:8081/api/secret
    ```

    You get `HTTP/1.1 401`: the microservice refuses, because nobody signed in.
11. **With a token, without the role** — sign in as `admin` and keep the token in the variable `TOKEN`:

    ```bash
    TOKEN=$(curl -s -d client_id=web_app -d username=admin -d password=admin -d grant_type=password \
      http://localhost:9080/auth/realms/entando-dev/protocol/openid-connect/token \
      | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
    curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/secret
    ```

    You get `HTTP/1.1 403`: Keycloak knows who you are, but `admin` does not have the role `hello-user` yet.
12. **Give the role to the user:** in Keycloak, *Users* → *View all users* → `admin` → tab *Role Mappings* →
    *Client Roles*: choose `internal` → select `hello-user` → *Add selected*.
13. **With a token and the role** — a token is a photo of the user at sign-in time, so ask for a **new** token,
    then call again:

    ```bash
    TOKEN=$(curl -s -d client_id=web_app -d username=admin -d password=admin -d grant_type=password \
      http://localhost:9080/auth/realms/entando-dev/protocol/openid-connect/token \
      | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
    curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/secret
    ```

    You get `HTTP/1.1 200` and `{"message":"Hello admin, only signed-in users can read this."}`.
    The token is valid for 5 minutes: after that, ask for a new one.
    To see what is inside the token, decode its middle part and look for `resource_access`:

    ```bash
    echo "$TOKEN" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null; echo
    ```
14. Repeat the checks of step 19: `/api/health` and `/api/hello` still answer `200` without a token,
    so the test page works as before.

**What you should see:** the same address answers `401` without a token, `403` with a valid token but without the role,
and `200` with a valid token and the role `hello-user`.
Try a fake token: `curl -i -H "Authorization: Bearer abc" http://localhost:8081/api/secret` → `401`.

**On Entando:** after you install version `1.0.0`, open the Keycloak of your Entando server, find the client
whose name ends with `hello-ms`: the role `hello-user` is already there. Give it to your users in the same way
(*Users* → user → *Role Mappings*); they must sign out and sign in again to get a token with the new role.

**Check:** `git add -A` then `git diff beginner-step-20`

## Step 21 — Call the protected API from the micro frontend

**Goal:** hello-receiver gets a button that reads `/api/secret` with the token of the signed-in user,
and shows a different text for each answer of hello-ms.

**Start:** step 20 finished (tag `beginner-step-20`), with Keycloak prepared as in step 20, points 9 and 12.

The button is shown to **everybody**: hiding it would protect nothing, because anyone can call the address
with `curl`. hello-ms decides, and the micro frontend only shows its answer:

| Answer of hello-ms | hello-receiver shows |
|---|---|
| `200` | the `message` of the answer |
| `403` (signed in, without the role) | `No permission` |
| `401`, no token, or no answer | `Guest user` |

A web page on another address (locally, hello-receiver on port 5173 and hello-ms on port 8081) cannot simply
send a token: before the real call, the browser asks the microservice with an `OPTIONS` call, **without** the
token, if this page may call it. This question is called *preflight*, and the rules that answer it are called
*CORS*. hello-ms already has the rules (`@CrossOrigin` in `HelloController.java`), but in step 20 Spring Security
checks the token first, so it answers the question of the browser with `401`.

1. Replace `microservices/hello-ms/src/main/java/org/entando/hello/SecurityConfig.java`: `cors` answers the
   question of the browser with the `@CrossOrigin` rules, before checking any token. The rules of `/api/secret` do not change:

   ```java
   package org.entando.hello;

   import java.util.ArrayList;
   import java.util.Collection;
   import java.util.List;
   import java.util.Map;
   import org.springframework.beans.factory.annotation.Value;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   import org.springframework.security.config.Customizer;
   import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
   import org.springframework.security.config.annotation.web.builders.HttpSecurity;
   import org.springframework.security.core.GrantedAuthority;
   import org.springframework.security.core.authority.SimpleGrantedAuthority;
   import org.springframework.security.oauth2.jwt.Jwt;
   import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
   import org.springframework.security.web.SecurityFilterChain;

   // The security rules of hello-ms: which web addresses need a signed-in user, and which roles.
   @Configuration
   @EnableMethodSecurity // turns on @PreAuthorize in the controllers
   public class SecurityConfig {

       @Bean
       SecurityFilterChain rules(HttpSecurity http, JwtAuthenticationConverter keycloakRoles) throws Exception {
           // Before a call with a token, the browser asks first (OPTIONS, without the token) if the call is allowed:
           // answer with the @CrossOrigin rules of the controller, before checking any token.
           http.cors(Customizer.withDefaults())
               .authorizeHttpRequests(auth -> auth
                   .requestMatchers("/api/secret").authenticated() // needs a valid Keycloak token
                   .anyRequest().permitAll()) // everything else stays public
               // Accept tokens (JWT) only if Keycloak signed them: see issuer-uri in application.yml.
               // The converter turns the Keycloak roles of the token into Spring authorities.
               .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakRoles)));
           return http.build();
       }

       // Keycloak writes the client roles of the user into the token, under the client that owns them:
       //   "resource_access": { "internal": { "roles": ["hello-user"] } }
       // Spring Security does not read this claim by itself: here we turn each role into an authority.
       @Bean
       JwtAuthenticationConverter keycloakRoles(@Value("${hello.keycloak.client-id}") String clientId) {
           JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
           converter.setJwtGrantedAuthoritiesConverter(token -> clientRoles(token, clientId));
           return converter;
       }

       // Reads only the roles of our own client: a role with the same name on another client does not count.
       static Collection<GrantedAuthority> clientRoles(Jwt token, String clientId) {
           Map<String, Object> resourceAccess = token.getClaimAsMap("resource_access");
           if (resourceAccess == null || !(resourceAccess.get(clientId) instanceof Map<?, ?> client)) {
               return List.of(); // no roles for our client in this token
           }
           List<GrantedAuthority> authorities = new ArrayList<>();
           if (client.get("roles") instanceof Collection<?> roles) {
               for (Object role : roles) {
                   authorities.add(new SimpleGrantedAuthority(role.toString()));
               }
           }
           return authorities;
       }
   }
   ```
2. Replace `microservices/hello-ms/src/test/java/org/entando/hello/HelloControllerTest.java` (new test: the browser
   of a local page may ask for `/api/secret`). Run `mvn test` in `microservices/hello-ms`: without point 1 the new test fails with `401`.

   ```java
   package org.entando.hello;

   import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
   import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
   import static org.mockito.Mockito.*;
   import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

   import java.util.List;
   import java.util.Map;
   import org.junit.jupiter.api.Test;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.test.context.bean.override.mockito.MockitoBean;
   import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
   import org.springframework.test.web.servlet.MockMvc;

   // Automatic checks of hello-ms. Run them with: mvn test
   @SpringBootTest
   @AutoConfigureMockMvc
   class HelloControllerTest {

       @Autowired
       MockMvc mvc; // calls our endpoints without a real web server

       @MockitoBean
       JdbcTemplate database; // a fake database, so the tests don't need PostgreSQL

       @Test
       void helloAnswersWithAMessage() throws Exception {
           when(database.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
           mvc.perform(get("/api/hello"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello from hello-ms!"));
       }

       @Test
       void secretNeedsAValidTokenAndTheHelloUserRole() throws Exception {
           // No token: 401 Unauthorized.
           mvc.perform(get("/api/secret")).andExpect(status().isUnauthorized());
           // A valid token, but without the role: 403 Forbidden.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of())))
               .andExpect(status().isForbidden());
           // The role on another client does not count: 403 Forbidden.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of("other-client", Map.of("roles", List.of("hello-user"))))))
               .andExpect(status().isForbidden());
           // A valid token with the role hello-user on our client: 200 OK.
           mvc.perform(get("/api/secret").with(keycloakToken(Map.of("internal", Map.of("roles", List.of("hello-user"))))))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Hello admin, only signed-in users can read this."));
       }

       @Test
       void browserMayAskForTheSecretFromALocalPage() throws Exception {
           // Before sending a token, the browser asks (OPTIONS, without the token) if the call is allowed.
           mvc.perform(options("/api/secret")
                   .header("Origin", "http://localhost:5173")
                   .header("Access-Control-Request-Method", "GET")
                   .header("Access-Control-Request-Headers", "authorization"))
               .andExpect(status().isOk())
               .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
       }

       // A fake Keycloak token for user "admin" with the given "resource_access" claim.
       // Its roles are read by the same code that hello-ms uses for the real tokens.
       private static JwtRequestPostProcessor keycloakToken(Map<String, Object> resourceAccess) {
           return jwt()
               .jwt(t -> t.claim("preferred_username", "admin").claim("resource_access", resourceAccess))
               .authorities(t -> SecurityConfig.clientRoles(t, "internal"));
       }
   }
   ```
3. Give hello-receiver the address of hello-ms with an API claim, as you did for hello-sender in step 13:

   ```bash
   ent bundle api add hello-receiver hello-api --serviceName=hello-ms --serviceUrl=http://localhost:8081
   ```

   It adds `apiClaims` to hello-receiver in `entando.json` and creates `microfrontends/hello-receiver/public/mfe-config.json`.
   The widget changes: in `entando.json` change the `version` of hello-receiver to `0.2.0`.
   Change the bundle `version` to `1.1.0`.
4. Replace `microfrontends/hello-receiver/src/App.jsx`. Entando now gives the widget two more things:
   the address of hello-ms (`systemParams` in `config`) and the Keycloak connection of the page (`window.entando.keycloak`):
   when a user signs in on an Entando page, `authenticated` is `true` and `token` is their token.
   `readSecret` sends the token in the header `Authorization: Bearer <token>`, exactly like `curl -H` in step 20,
   and turns the status code into a text. React writes the answer as text: text from the network never becomes HTML.

   ```jsx
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
   ```
5. Add at the end of `microfrontends/hello-receiver/src/hello-receiver.css` the style of the new row:

   ```css
   .secret {
     display: flex;
     align-items: center;
     gap: 12px;
     margin-top: 8px;
   }

   button {
     padding: 6px 12px;
     font: inherit;
     cursor: pointer;
   }
   ```
6. Replace `microfrontends/hello-receiver/index.html`. The test page plays the part of Entando: it writes the address
   of hello-ms into `config`, and it has a box where you paste a token, like a user who signs in:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>hello-receiver — local test page</title>
     <!-- A page style that would make every paragraph red: the shadow DOM protects the receiver from it. -->
     <style>p { color: red; }</style>
   </head>
   <body>
     <h1>hello-receiver</h1>
     <p>This paragraph is red; the receiver below stays green.</p>

     <!-- On Entando, the platform writes the config attribute. Here we write it by hand:
          systemParams.api gives the address of hello-ms ("apiClaims" in entando.json). -->
     <hello-receiver config='{"contextParams":{"page_code":"homepage"},"systemParams":{"api":{"hello-api":{"url":"http://localhost:8081"}}}}'></hello-receiver>

     <!-- hello-sender is deployed on its own: here we play its part and publish the "hello" event ourselves. -->
     <h2>Pretend to be hello-sender</h2>
     <input id="text" value="Hello from the test page!">
     <button id="send">Publish "hello"</button>
     <button id="toggle">Remove / add the receiver</button>

     <!-- On Entando, the page signs the user in with Keycloak. Here we paste a token obtained with curl. -->
     <h2>Pretend to be Entando: the signed-in user</h2>
     <input id="token" placeholder="Paste a token here (empty = nobody signed in)" size="50">
     <button id="signin">Use this token</button>

     <script type="module" src="/src/main.jsx"></script>
     <script type="module">
       import { mediatorInstance } from '@entando/mfecommunication';

       document.querySelector('#send').onclick = () =>
         mediatorInstance.publish('hello', { text: document.querySelector('#text').value });

       // What Entando does on a real page: window.entando.keycloak tells the widgets who is signed in.
       document.querySelector('#signin').onclick = () => {
         const token = document.querySelector('#token').value.trim();
         window.entando = { ...window.entando, keycloak: { authenticated: token !== '', token } };
       };

       // Removing the element calls disconnectedCallback (unsubscribe); adding it back subscribes again.
       const receiver = document.querySelector('hello-receiver');
       document.querySelector('#toggle').onclick = () =>
         receiver.isConnected ? receiver.remove() : document.body.insertBefore(receiver, document.querySelector('h2'));
     </script>
   </body>
   </html>
   ```
7. Start everything, each command in its own terminal:

   ```bash
   ent bundle svc start postgresql keycloak
   ent bundle build hello-ms && ent bundle run hello-ms
   ent bundle run hello-receiver
   ```
8. **Try it in the browser.** Open <http://localhost:5173> and click **Read the secret** after each change of the token
   (paste it, then click **Use this token**). Ask for a token with the command of step 20, point 13, and print it with
   `echo $TOKEN` to copy it; it lasts 5 minutes.

   | Token in the box | hello-receiver shows | Why |
   |---|---|---|
   | empty | `Guest user` | nobody signed in: the widget does not even call hello-ms |
   | `abc` | `Guest user` | hello-ms answers `401`: Keycloak did not sign this token |
   | a new token of `admin`, who has the role `hello-user` | `Hello admin, only signed-in users can read this.` | `200` |
   | a new token of `admin` after you remove the role (*Users* → `admin` → *Role Mappings* → *Client Roles* `internal` → select `hello-user` → *Remove selected*) | `No permission` | `403` |

   At the end, give the role back to `admin` as in step 20, point 12.
   Open the browser developer tools (`F12`) → *Network*: before each call with a token you see the `OPTIONS`
   call of the browser, answered with `200`.

**What you should see:** hello-receiver shows `Guest user` without a valid token, `No permission` with a valid token
but without the role, and the message of hello-ms with a valid token and the role `hello-user`.

**On Entando:** install version `1.1.0` and put *Hello Receiver* on a page. Signed out you see `Guest user`;
signed in without the role, `No permission`; signed in with the role, the message. On Entando the page and
hello-ms have the same address, so the browser does not need to ask with `OPTIONS` first.

**Check:** `git add -A` then `git diff beginner-step-21`

**Congratulations!** You built a complete Entando bundle: two micro frontends that talk through events,
a microservice with a database, a settings form, and a REST endpoint protected by Keycloak with a role, called by a micro frontend with the token of the signed-in user. Pack, publish, deploy and
install version `1.1.0` as in step 3 to see it all on your Entando server.
