# start from base
FROM ubuntu:18.04

# install system-wide deps for python and node
RUN apt-get -yqq update
RUN apt-get -yqq install python-pip python-dev
RUN apt-get -yqq install nodejs npm

# copy our application code
ADD flask /opt/flask
WORKDIR /opt/flask

# fetch app specific deps
RUN npm install
RUN npm run build
RUN pip install -r requirements.txt

# expose port
EXPOSE 8000

# start app
CMD [ "python", "./app.py" ]
