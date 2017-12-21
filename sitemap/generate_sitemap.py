import os
import time

output_folder = 'sitemap/outputFiles'
days_since_modified = 0

sitemaps_exist = os.path.exists(output_folder)

if sitemaps_exist:
    last_modified = os.path.getmtime(output_folder)
    now = time.time()
    days_since_modified = round((now - last_modified) / (3600 * 24))

if not sitemaps_exist or days_since_modified > 6:
    import listingsmap
    import communitiesmap
