#!/bin/bash
foldername="dist-$(date +%h%d-%Y-%H.%M.%S)"
mkdir $foldername
cp -R public "${foldername}/public"
cp images/explore-favicon.png "${foldername}/public/images/"
cp ./package.json "${foldername}/"
cp ./ssr-server.js "${foldername}/"
cp ./sitemap/outputFiles/* "${foldername}/"

tarfile="${foldername}-.tar.gz"
tar -zcvf $tarfile $foldername
scp $tarfile elt-dev:/opt/user-portal-newux/
deploydest="/opt/user-portal-newux"
server="/opt/server"
ssh elt-dev "cd ${deploydest} && rm ${server} && tar -xvzf ${tarfile} && ln -s ${deploydest}/${foldername} ${server}"
ssh elt-dev "cd ${deploydest}/${foldername} && yarn install --modules-folder ${deploydest}/node_modules && DISABLE_ANALYTICS=true pm2 restart all --update-env"
