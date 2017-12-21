#!/bin/bash
foldername="dist-$(date +%h%d-%Y-%H.%M.%S)"
python  sitemap/generate_sitemap.py
cp -R sitemap/outputFiles/ dist
cp -R dist $foldername
tarfile="${foldername}-.tar.gz"
tar -zcvf $tarfile $foldername
scp $tarfile elt-prod:/opt/CommunityManagerPortal/react-releases/
deploydest="/opt/CommunityManagerPortal/react-releases"
web="/opt/CommunityManagerPortal/react-web"
ssh elt-prod "cd ${deploydest} && rm -f last-release && ln ${web} ${deploydest}/last-release && rm ${web} && tar -xvzf ${tarfile} && ln -s ${deploydest}/${foldername} ${web} && ls -l ${web}"
