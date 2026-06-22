# 1 Create Dockerfile

# 2 Build image

docker build -t myapp .

# 3 Verify image exists

docker images

# 4 Run container

docker run --name mycontainer -p 3000:3000 myapp

# 5 Check running container

docker ps

# 6 Stop

docker stop mycontainer

# 7 Start again later

docker start mycontainer
