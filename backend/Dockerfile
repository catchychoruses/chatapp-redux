FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY .env ./

RUN npm install && npm i -g ts-node nodemon 
   

COPY . .

RUN npm run build



EXPOSE 3000

CMD [ "npm", "start" ]