"""creates a sitemap 'usersmap.xml' for all member pages"""

from utils import fetch_content
import urllib2
import os

url = "https://www.explorelifetraveling.com/eltApp/api/v0.1/elt_groups/"

data = []


def get_data(url):

    temp_data = fetch_content(url)
    data.extend(temp_data['results'])
    if temp_data['next']:
        get_data(temp_data['next'])


def append_data(sitemap, data):

    def get_id(member):
        url = member['url']
        return url.split('/')[-2]

    for item in data:
        if item['status'] != 'PUBLISHED':
            continue

        sitemap.write("\t<url>\n\t\t<loc>")
        name = urllib2.quote(item['name'])
        loc = 'https://www.explorelifetraveling.com/community/' + name
        sitemap.write(loc + '</loc>\n')
        sitemap.write("\t</url>\n")


filename = os.path.join(os.getcwd(), 'sitemap/outputFiles/communitiesmap.xml')
with open(filename, 'w') as sitemap, open('sitemap/top_template.xml') as top, \
        open('sitemap/bottom_template.xml') as bottom:
    sitemap.write(top.read())
    get_data(url)
    append_data(sitemap, data)
    sitemap.write(bottom.read())
