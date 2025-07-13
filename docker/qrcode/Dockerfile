FROM public.ecr.aws/lambda/nodejs:22
ARG PNPM_VERSION
WORKDIR ${LAMBDA_TASK_ROOT}
RUN npm install -g pnpm@${PNPM_VERSION}
# Install system dependencies required for the node-canvas library
# https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling
RUN dnf update -y && \
  dnf install -y \
  gcc-c++ \
  cairo-devel \
  pango-devel \
  libjpeg-turbo-devel \
  giflib-devel && \
  dnf clean all
COPY ../qrcode/package.json ../qrcode/pnpm-lock.yaml ../qrcode/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY ../qrcode/dist/ ./dist/
RUN rm -rf node_modules/.cache
CMD ["dist/index.handler"]
