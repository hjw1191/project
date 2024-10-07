# Base image
FROM node:20.11.0-slim as base
LABEL fly_launch_runtime="Node.js/Prisma"

# Node.js/Prisma app lives here
WORKDIR /app

# Set production environment (use development if you need devDependencies)
ENV NODE_ENV="development"

# Install Yarn
ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Copy and install dependencies (including devDependencies)
COPY --link package-lock.json package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Generate Prisma Client
COPY --link prisma ./
RUN npx prisma generate

# Copy application code
COPY --link . .

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application from build stage
COPY --from=build /app /app

# Expose port and set the command to start the server
EXPOSE 3000
CMD ["yarn", "start"]