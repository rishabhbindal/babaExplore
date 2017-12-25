"""creates a sitemap 'listingsmap.xml' for all listing pages"""

from utils import fetch_content
import urllib2
import os

url = "https://www.explorelifetraveling.com/eltApp/api/v0.1/properties/?dev_all"
data = []


def get_data(data_url):

    temp_data = fetch_content(data_url)
    data.extend(temp_data['results'])
    if temp_data['next']:
        offset = temp_data['next'].split('?')[-1]
        next_url = url + '&' + offset
        get_data(next_url)


def append_data(sitemap, data):

    for item in data:

        if item['status'] != 'PUBLISHED':
            continue
        type = 'listing' if item['type'] != 'EXPERIENCE' else 'events'

        sitemap.write("\t<url>\n\t\t<loc>")
        code = urllib2.quote(item['code'])
        sitemap.write('https://www.explorelifetraveling.com/' + type + '/' +
                      code + '</loc>\n')
        sitemap.write("\t</url>\n")


filename = os.path.join(os.getcwd(), 'sitemap/outputFiles/listingsmap.xml')
with open(filename, 'w') as sitemap, open('sitemap/top_template.xml') as top, \
        open('sitemap/bottom_template.xml') as bottom:
    sitemap.write(top.read())
    get_data(url)
    append_data(sitemap, data)
    sitemap.write(bottom.read())
