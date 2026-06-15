# Build Everything from Local Workspace (Recommended)

# 1. Use the correct Ubuntu 24.04 LTS official image

FROM ubuntu:24.04

# Avoid prompt pauses during installations

ENV DEBIAN_FRONTEND=noninteractive

# 2. Update packages and install lightweight dependencies

RUN apt-get update && \
 apt-get install -y curl gnupg && \
 curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
 apt-get install -y nodejs && \
 apt-get clean && \
 rm -rf /var/lib/apt/lists/\*

# 3. Create and set the target working directory

WORKDIR /app

# 4. Copy package manifests first to leverage Docker's build cache

COPY package\*.json ./

# 5. Install dependencies inside the container

RUN npm install

# 6. Copy the rest of the application files

COPY . .

# 7. Expose the formal port 3000

EXPOSE 3000

# 8. Run the development server

CMD ["npm", "run", "dev"]
