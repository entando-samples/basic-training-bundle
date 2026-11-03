# Hello Bundle — Windows guide

This page goes with the step-by-step guide [`STEPS.html`](STEPS.html). Follow [`STEPS.html`](STEPS.html) step by step: this page tells you
what to install on Windows, and what to do differently in the few steps where Windows is not like Linux or macOS.
A step that is not named here works exactly as [`STEPS.html`](STEPS.html) says.

## Choose how to work

On Windows there are two ways to follow the course. Choose one before step 1 and keep it until the end.

| | WSL 2 (recommended) | Git Bash |
|---|---|---|
| What it is | A real Linux (Ubuntu) inside Windows | A bash terminal for Windows programs |
| The commands of the guide | Work as written | Work, after one npm setting before step 7 |
| Where you install the tools | Inside Ubuntu | In Windows |
| Docker | Docker Desktop, with WSL integration | Docker Desktop |

**Do not mix the two.** For example, a project inside Ubuntu built with the Node.js of Windows does not work.
Every command in this page and in [`STEPS.html`](STEPS.html) is typed in **one** kind of terminal: the Ubuntu terminal for
WSL 2, the *Git Bash* window for Git Bash. Never PowerShell or the Command Prompt, except where this page says so.

## Option A — WSL 2 (recommended)

### Install

1. Open **PowerShell as administrator** (the only time you need it) and install Ubuntu:

   ```powershell
   wsl --install -d Ubuntu
   ```

   Restart Windows when it asks. At the first start, Ubuntu asks for a Linux user name and password: choose
   them and write them down. Then check, again in PowerShell, that the `VERSION` of Ubuntu is `2`:

   ```powershell
   wsl -l -v
   ```
2. Install **Docker Desktop** for Windows. In Docker Desktop open *Settings* → *Resources* → *WSL integration*
   and turn on **Ubuntu**. Docker Desktop must be running every time you work on the course.
3. Open the **Ubuntu** terminal (from the Start menu) and install the tools there:

   ```bash
   sudo apt update
   sudo apt install -y git curl openjdk-17-jdk maven
   ```

   The Node.js of Ubuntu is too old for Vite. Install Node.js 20.19 or newer with
   [nvm](https://github.com/nvm-sh/nvm), following its instructions, then:

   ```bash
   nvm install 22
   ```

   Install the `ent` command line (Entando 7.5) inside Ubuntu, with the Linux instructions of Entando.
4. Check the tools as [`STEPS.html`](STEPS.html) says in *Tools to install*, in the Ubuntu terminal. Then check that every
   tool is the Linux one, inside Ubuntu:

   ```bash
   which git java mvn node ent docker
   ```

   No line may start with `/mnt/c/`: that would be a Windows program, and the course does not work with it.

### Where the project lives

Clone the project in your Linux home folder, **not** in a Windows folder (`/mnt/c/...`):

```bash
cd ~
git clone --branch beginner-version https://github.com/entando-samples/basic-training-bundle.git hello-bundle
cd hello-bundle
```

Under `/mnt/c` npm is very slow, and Vite does not see when you save a file, so the test page of hello-receiver
does not reload.

To edit the files, install Visual Studio Code in Windows with its **WSL** extension, then type `code .` in
the project folder. In the Windows File Explorer, the project is at `\\wsl$\Ubuntu\home\<your Linux user>\hello-bundle`.

### The browser

Use the browser of Windows: the addresses of the guide, like <http://localhost:5000>, open as they are, because
WSL 2 passes `localhost` to Windows. As [`STEPS.html`](STEPS.html) says, always type `localhost`, not `127.0.0.1`.

### What changes in the steps (WSL 2)

- **Step 3** — the kubeconfig file from your trainer is in a Windows folder. Copy it into Ubuntu first:

  ```bash
  cp /mnt/c/Users/<your Windows user>/Downloads/<the kubeconfig file> ~/kubeconfig
  ent attach-kubeconfig ~/kubeconfig
  ```

  `docker login` works as written: Docker Desktop keeps the login.
- **Step 20** — Keycloak must write its database in `svc/keycloak/keycloak-db/`, and inside its container it
  runs as the user with id 1000. The first Linux user of Ubuntu usually has the id 1000 (check with `id -u`):
  then Keycloak works. If your id is not 1000, use the `chmod` of step 20, point 8.

Every other step works exactly as in [`STEPS.html`](STEPS.html).

## Option B — Git Bash

### Install

Install these Windows programs, each with its normal installer:

1. **Git for Windows**: it contains *Git Bash*.
2. **Docker Desktop**. It must be running every time you work on the course.
3. **Java 17** (for example Eclipse Temurin 17) and **Maven 3.6.3 or newer**. Maven is a zip: unpack it and
   add its `bin` folder to the `Path` of Windows.
4. **Node.js 20.19 or newer**, from the installer of nodejs.org.
5. The `ent` command line (Entando 7.5), with the Windows instructions of Entando.

Open **Git Bash** (from the Start menu) and check the tools as [`STEPS.html`](STEPS.html) says in *Tools to install*.
Type every command of the course in Git Bash.

If your Windows user name has a space (`C:\Users\Mario Rossi`), clone the project in a folder without spaces,
for example `C:\work`:

```bash
mkdir -p /c/work && cd /c/work
git clone --branch beginner-version https://github.com/entando-samples/basic-training-bundle.git hello-bundle
cd hello-bundle
```

### Once, before step 7: let npm use Git Bash

`ent` runs the `commands` of `entando.json` with bash, but npm runs the scripts of `package.json` with the
Command Prompt of Windows, even when you start it from Git Bash. From step 7, the `build` script of hello-sender
uses `mkdir -p` and `cat`, which the Command Prompt does not know. Tell npm to use the bash of Git Bash:

```bash
npm config set script-shell "$(cygpath -w "$(which bash)")"
npm config get script-shell     # shows the bash.exe of Git, for example C:\Program Files\Git\usr\bin\bash.exe
```

Without it, `ent bundle run hello-sender` stops with *'cat' is not recognized as an internal or external
command*, and a folder named `-p` appears in `microfrontends/hello-sender`.

### Line endings

On Windows, Git changes the end of every line when it writes the files (the setting `core.autocrlf`).
That is normal: `git diff beginner-step-NN` still compares correctly. Do not change this setting during the course.

### What changes in the steps (Git Bash)

- **Step 3** — give `ent attach-kubeconfig` the path in Git Bash style, for example
  `ent attach-kubeconfig ~/Downloads/<the kubeconfig file>`.
- **Step 7** — set the npm script shell first (see above).
- **Step 20** — skip the `chmod` of point 8: with Docker Desktop, Keycloak can always write its database.
  The `curl`, `sed` and `TOKEN=$(...)` commands work in Git Bash; they do not work in PowerShell.

Every other step works exactly as in [`STEPS.html`](STEPS.html).

## When something does not work

| What you see | Why | What to do |
|---|---|---|
| `docker: command not found` in Ubuntu | Docker Desktop is closed, or WSL integration is off | Start Docker Desktop and turn on *WSL integration* for Ubuntu |
| *'cat' is not recognized…* and a folder `-p` (Git Bash) | npm uses the Command Prompt | Set the npm script shell (Git Bash, before step 7) |
| The test page of hello-receiver does not reload (WSL 2) | The project is under `/mnt/c` | Clone it again in `~` |
| A page opens inside Ubuntu (`curl http://localhost:5173`) but not in the Windows browser (WSL 2) | Windows does not get that address from WSL | In Windows 11, create `C:\Users\<you>\.wslconfig` with the two lines `[wsl2]` and `networkingMode=mirrored`, run `wsl --shutdown` in PowerShell, then open Ubuntu again |
| Port `5000` or `5001` is *already in use* or *access denied*, but nothing of yours uses it | Windows reserves some ports for itself | In PowerShell: `netsh interface ipv4 show excludedportrange protocol=tcp`; if the port is in a range, ask your trainer |
| *The microservice is not reachable.* | hello-ms is not running yet, or the address is `127.0.0.1` | See steps 13 and 17 of [`STEPS.html`](STEPS.html) |
