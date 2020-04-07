#!/bin/sh
set -e

if [ ! -e package.json ]
then
  echo "This does not looks like a node project. package.json file is missing"
  exit 1
fi

if [ -e yarn.lock ]
then
  yarn --production=false
else
  npm install
fi

echo "Hello world"