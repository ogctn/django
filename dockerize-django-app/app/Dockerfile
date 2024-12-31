FROM python:3

# Ensure Python output sent straight to terminal
ENV PYTHONUNBUFFERED=1 

RUN mkdir -p /usr/src/app/app
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip uninstall django
RUN pip install -r requirements.txt 
