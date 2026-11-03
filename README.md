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
