FROM node:lts

WORKDIR /app

COPY . ./

RUN npm ci

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod" ]