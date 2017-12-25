#!/bin/bash
foldername="dist-$(date +%h%d-%Y-%H.%M.%S)"
mkdir $foldername
python2  sitemap/generate_sitemap.py
cp -R public "${foldername}/public"
cp images/explore-favicon.png "${foldername}/public/images/"
cp ./package.json "${foldername}/"
cp ./ssr-server.js "${foldername}/"
cp ./sitemap/outputFiles/* "${foldername}/"

tarfile="${foldername}-.tar.gz"
tar -zcvf $tarfile $foldername

scp $tarfile elt-prod:/opt/CommunityManagerPortal/react-ssr/
deploydest="/opt/CommunityManagerPortal/react-ssr"
current="/opt/CommunityManagerPortal/react-ssr-current"
previous="react-ss-previous"
ssh elt-prod "cd ${deploydest} && rm -f ${previous} && ln ${current} ${deploydest}/${previous} && rm -f ${current}"
ssh elt-prod "cd ${deploydest} && tar -xvzf ${tarfile} && ln -s ${deploydest}/${foldername} ${current} && ls -l ${current}"
ssh elt-prod "cd ${deploydest}/${foldername} && yarn install --modules-folder ${deploydest}/node_modules && pm2 restart all"
