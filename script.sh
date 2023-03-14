#!/usr/bin/env bash

json_repos=$(node app.js)

repos=$(echo $json_repos | sed -e 's/BITBUCKET CLOUD API LATEST UPDATES://g' | sed -e 's!http\(s\)\{0,1\}://[^[:space:]]*!!g' | sed -e 's/\[ //g' -e 's/\ ]//g' -e "s/ //g" -e 's/\,/ /g')
arr=( $repos )

for repo in ${arr[@]}; do
  echo
  echo "* Processing $repo..."
  echo
  git clone https://kalbakry@bitbucket.org/iotblueSaaS/account-management.git
#   echo ${repo//\'}
done