# Docker workflow

Here is your complete cheat sheet consolidated into a single, perfectly formatted `reference.md` file block. You can copy the code block below directly into your repository.

Markdown

```bash
# 🐳 Docker Cheat Sheet (Beginner Friendly)

This document summarizes the core Docker concepts, workflow, and commands to avoid confusion between **images, containers, Dockerfile, build, run, and lifecycle management**.

---

## 1. Core Concepts (IMPORTANT MENTAL MODEL)

### 📄 Dockerfile = Recipe
A file that describes how to build an image.

* **Contains instructions like:**
  * `FROM` (base image)
  * `RUN` (install commands)
  * `COPY` (copy files)
  * `CMD` (default command)

> 👉 **Does NOTHING until built.**

---

### 🧱 Image = Blueprint / Template
A built version of a Dockerfile.

* Immutable (does not run by itself)
* Used to create containers
* **Example:** `node:latest`, `my-app:latest`

**Check images:**
```bash
docker images
```

---

### 📦 Container = Running Instance

A live execution of an image.

- Can start, stop, restart, delete
- Each `docker run` creates a **NEW** container

**Check containers:**

Bash

`docker ps        # Running only
docker ps -a     # All (including stopped)`

---

## 2. Workflow (VERY IMPORTANT)

### Step 1: Build Image

Bash

`docker build -t my-app .`

- **Meaning:**
    - `t` → name/tag the image
    - `.` → use current folder (Dockerfile location)
- 👉 **Output:** Image created

### Step 2: Run Container

Bash

`docker run --name my-container my-app`

- **Meaning:**
    - Image → container
    - `-name` → gives container a readable name

### Step 3: Stop Container

Bash

`docker stop my-container`

### Step 4: Start Existing Container

Bash

`docker start my-container`

> ⚠️ **IMPORTANT:**
> 
> - `run` = create a **NEW** container
> - `start` = reuse an **EXISTING** container

---

## 3. Image vs Container Naming Confusion

| Type | Example Name |
| --- | --- |
| **Image** | `my-app:latest` |
| **Container** | `my-app-container` |

Export to Sheets

---

## 4. Useful Commands

### Images

Bash

`docker images
docker rmi image_name`

### Containers

Bash

`docker ps
docker ps -a
docker rm container_name`

### Logs (VERY IMPORTANT)

Bash

`docker logs container_name`

---

## 5. Ports (for web apps)

Bash

`docker run -p 3000:3000 my-app`

- **Meaning:**
    - **Left side** = your machine (host)
    - **Right side** = container
- **Example:** `localhost:3000` → `container:3000`

---

## 6. Common Mistakes

### ❌ Mistake 1: Re-running instead of starting

Bash

`docker run my-app`

👉 *Creates MANY redundant containers.*

- ✔ **Fix:**

Bash

`docker start my-container`

### ❌ Mistake 2: Not naming containers

Docker auto-generates random names like `sleepy_roentgen` or `bold_dhawan`.

- ✔ **Fix:**

Bash

`docker run --name express-app my-app`

### ❌ Mistake 3: Confusing build options

- **Wrong:** `docker build . --name my-app`
- ✔ **Correct:** `docker build -t my-app .`

### ❌ Mistake 4: Thinking container = image

- **Image** = template
- **Container** = running instance

---

## 7. Container Lifecycle

Plaintext

`Dockerfile
   ↓ (build)
Image
   ↓ (run)
Container (created/running)
   ↓ (stop/start)
Stopped container
   ↓ (remove)
Deleted container`

---

## 8. Cleanup Commands (VERY USEFUL)

**Remove stopped containers:**

Bash

`docker container prune`

**Remove unused images:**

Bash

`docker image prune`

**Full system cleanup:**

Bash

`docker system prune`

---

## 9. Debugging

**Check why container failed:**

Bash

`docker logs <container_name>`

**Common exit codes:**

- `(0)` → Normal exit
- `(1)` → Application error / crash
- `(137)` → Killed / force stopped (e.g., out of memory or system shutdown)

---

## 10. Golden Rule (MOST IMPORTANT)

You **NEVER** run a Dockerfile directly. You always follow this sequential path:

Dockerfilebuild

[](data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"></path></svg>)

Imagerun

[](data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"></path></svg>)

Container

---

## 11. Mental Shortcut

- **build** = create image
- **run** = create & launch container
- **start** = reuse stopped container
- **stop** = pause container
- **rm** = delete container