# Dockerhub

- https://docs.docker.com/get-started/04_sharing_app/
- `docker image ls | head` 找出合適的名稱，例如「docker-app-pdf-to-crop-svg-app」
- 建立對應的repo https://hub.docker.com/
- https://hub.docker.com/repository/docker/pudding/docker-app/general
- pudding/docker-app
- `docker tag docker-app-pdf-to-crop-svg-app pudding/docker-app:node-20-inkscape-20230922-2210`
- `docker push pudding/docker-app:node-20-inkscape-20230922-2210`
- 修改Dockerfile `FROM pudding/docker-app:node-20-inkscape-20230922-2210`


- 加入到監控清單 https://github.com/democwise2016/dockerhub-image-refresher/edit/main/docker-image-list.txt