# Stage 1 - Build the React app
FROM node:18-alpine AS build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Serve with Node.js
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build /app/build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]