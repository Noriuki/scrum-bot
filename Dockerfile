FROM node:22-alpine3.22

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

RUN rm -rf node_modules && yarn install --frozen-lockfile --production

EXPOSE 3000

CMD ["node", "dist/main.js"]
