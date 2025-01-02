FROM node:22
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

WORKDIR /usr/src/app

COPY package*.json *.js ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]

