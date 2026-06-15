#Scenario B: Automated GitHub Cloned Build
#=========================================

#Use the correct Ubuntu 24.04 LTS official image
FROM ubuntu:24.04

#Avoid prompt pauses during installations
ENV DEBIAN_FRONTEND=noninteractive

#Install Git, Curl, and Node.js
RUN apt-get update && \
    apt-get install -y curl git gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

#Configure the destination working directory
WORKDIR /ubuntu_react

#Clone the repository
RUN git clone https://github.com/Alicade123/snowflakes-and-balloons-simulator.git app

#Switch working directory to the cloned repo folder containing package.json
WORKDIR /ubuntu_react/app

#Install dependencies
RUN npm install

#Expose port
EXPOSE 3000

#Start server
CMD ["npm", "run", "dev"]