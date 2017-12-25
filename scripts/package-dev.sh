#!/bin/bash
foldername="dist-$(date +%h%d-%Y-%H.%M.%S)"
cp -R dist $foldername
tarfile="${foldername}-.tar.gz"
tar -zcvf $tarfile $foldername
scp $tarfile elt-dev:/opt/user-portal-newux/
deploydest="/opt/user-portal-newux"
web="/opt/web"
ssh elt-dev "cd ${deploydest} && rm ${web} && tar -xvzf ${tarfile} && ln -s ${deploydest}/${foldername} ${web} && ls -l ${web}"
