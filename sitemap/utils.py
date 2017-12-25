import requests;

def fetch_content(url):
    """returns response from a 'GET' to the url passed"""

    print 'Fetching: ' + url
    r = requests.get(url)
    return r.json()
