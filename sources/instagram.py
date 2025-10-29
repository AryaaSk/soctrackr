# Instagram source implementation for EventTracker

from .base import SourceChecker
from .openai import GenerateEventDescriptions
import datetime
from utils.dates import *
from utils.env_loader import get_env
from apify_client import ApifyClient

apifyToken = get_env('APIFY_TOKEN', required=True)
print(f"Apify token: {apifyToken}")
client = ApifyClient(token=apifyToken)

class InstagramSourceChecker(SourceChecker):
    """
    Source class for Instagram accounts.
    Checks Instagram posts for event information.
    """
    
    def __init__(self):
        super().__init__("Instagram")
    
    def _GetPostsJSON(self, identifier: str, lastCheckedDate: str): #lastCheckedDate is in format dd/mm/yyyy

        #need to covnert lastCheckedDate to YYYY-MM-DD format
        lastCheckedDateScrapperFormat = lastCheckedDate.split("/")
        lastCheckedDateScrapperFormat = lastCheckedDateScrapperFormat[2] + "-" + lastCheckedDateScrapperFormat[1] + "-" + lastCheckedDateScrapperFormat[0]

        run_input = {
            "addParentData": False,
            "directUrls": [
                "https://www.instagram.com/" + identifier + "/",
            ],
            "enhanceUserSearchWithFacebookPage": False,
            "isUserReelFeedURL": False,
            "isUserTaggedFeedURL": False,
            "onlyPostsNewerThan": lastCheckedDateScrapperFormat,
            "resultsType": "posts",
            "searchLimit": 1,
            "searchType": "hashtag"
        }

        run = client.actor("apify/instagram-scraper").call(run_input=run_input, logger=None)

        #extract json string from run, and return as list of dicts
        items = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            #scaper ignores timestamp for pinned posts
            try:
                #extract timestamp from item
                if "timestamp" not in item:
                    print(f"Skipping item without timestamp: {item}")
                    continue
                    
                timestamp = item["timestamp"]
                timestamp = datetime.datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%d/%m/%Y %H:%M")
                
                #convert timestamp to epoch timestamp, and compare to lastCheckedDate
                timestampEpoch = ConvertDateTimeToEpoch(timestamp)
                lastCheckedEpoch = ConvertDateTimeToEpoch(lastCheckedDate + " 00:00")
                if (timestampEpoch > lastCheckedEpoch):
                    items.append(item)
            except:
                pass

        return items

    def CheckForNewEvents(self, identifier: str, lastCheckedDate: str): #lastCheckedDate is in format dd/mm/yyyy
        # send sources + newer than timestamp to instagram api to get jsom
        jsonData = self._GetPostsJSON(identifier, lastCheckedDate)
        print(f"Scraped {len(jsonData)} posts for {identifier}")
        
        try:
            error = jsonData[0]["error"]
            if (error != "no_items"):
                print(f"Error: {error}")
            return [] #if there is an error, return empty list
        except:
            pass
            
        if (len(jsonData) == 0):
            return []

        posts = []
        for post in jsonData:
            #for each post, we need combine all images urls in an image url list, and get the caption
            imageURLs = []
            if post["type"] == "Image" or post["type"] == "Video": 
                imageURLs = [ post["displayUrl"] ]

            elif post["type"] == "Sidecar":
                imageURLs = post["images"]

            caption = post["caption"]
            timestamp = post["timestamp"]
            altImageText = post["alt"]
            link = post["url"]

            #ignoring image urls for now, since I don't know if GPT even uses them
            posts.append({
                "caption": caption,
                "timestamp": timestamp,
                "altImageText": altImageText,
                "imageURL": imageURLs[0] if len(imageURLs) > 0 else "", #we only need one image url, as we do not actually use the image to gather data, simply for UI improvements
                "link": link
            })

        #print(posts)

        #returns in format {name: string, location: string, dateTimeStart: dd/mm/yyyy hh:mm, dateTimeEnd: dd/mm/yyyy hh:mm, description: string, imageURL: string}[]
        gptResponse = []
        attempts = 0
        while attempts < 3:
            try:
                gptResponse = GenerateEventDescriptions(posts)
                break
            except:
                attempts += 1
                if attempts == 3:
                    raise Exception(f"Failed to generate event descriptions from GPT, posts: {posts}")
                    
        print(f"Generated {len(gptResponse)} events for {identifier} from GPT")
        return gptResponse