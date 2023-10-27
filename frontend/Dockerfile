FROM node:21

WORKDIR /app

COPY package*.json .

COPY .env.local ./

RUN npm instal --omit-dev && npm i -g serve 
   

COPY . .

RUN  npm run build

WORKDIR /app/dist

EXPOSE 8080

CMD [ "serve", "-p", "8080" ]