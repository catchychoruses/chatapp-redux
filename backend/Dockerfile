FROM node:21

WORKDIR /app

COPY package.json package-lock.json ./

COPY package*.json ./

COPY .env ./

RUN npm install -omit-dev && npm i -g ts-node nodemon 
   
COPY . .

WORKDIR /app/dist

EXPOSE 3000

CMD [ "npm", "start" ]