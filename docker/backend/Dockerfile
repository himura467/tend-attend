FROM amazonlinux:2023 AS amazonlinux
ARG PYTHON_VERSION
ENV PYTHONIOENCODING=utf-8 \
  LANG=C.UTF-8 \
  PYTHON_HOME=/opt/python/versions/${PYTHON_VERSION} \
  PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_ROOT_USER_ACTION=ignore
RUN yum update -y && \
  yum install -y wget tar make gzip gcc zlib-devel openssl-devel libffi-devel && \
  wget https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz && \
  tar xzf Python-${PYTHON_VERSION}.tgz && \
  cd Python-${PYTHON_VERSION} && \
  ./configure --enable-optimizations --prefix=${PYTHON_HOME} && \
  make -j $(nproc) && \
  make altinstall && \
  cd .. && \
  rm -rf Python-${PYTHON_VERSION} Python-${PYTHON_VERSION}.tgz && \
  wget https://bootstrap.pypa.io/get-pip.py && \
  ${PYTHON_HOME}/bin/python$(echo ${PYTHON_VERSION} | cut -d. -f1-2) get-pip.py && \
  rm get-pip.py && \
  yum clean all
RUN ln -s ${PYTHON_HOME}/bin/python$(echo ${PYTHON_VERSION} | cut -d. -f1-2) ${PYTHON_HOME}/bin/python
ENV PATH="${PYTHON_HOME}/bin:${PATH}"
COPY ../backend/app/main.py ../requirements.txt ../backend/alembic.ini ./
RUN pip install --no-cache-dir -r requirements.txt --target python && \
  rm requirements.txt
COPY ../backend/app/alembic/ ./dependencies/python/app/alembic/
COPY ../backend/app/api/ ./dependencies/python/app/api/
COPY ../backend/app/core/ ./dependencies/python/app/core/
