FROM node:12-alpine

LABEL maintainer="Sergio Moura <sergio@moura.ca>"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]