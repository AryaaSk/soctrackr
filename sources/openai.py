from openai import OpenAI
import json
from utils.env_loader import get_env

apikey = get_env('OPENAI_API_KEY', required=True)
OpenaiClient = OpenAI(api_key=apikey)

def GenerateEventDescriptions(posts: list[dict[str, any]]) -> list[str]:
    content = (
        f"Given the following Instagram posts information: "
    )

    for idx, post in enumerate(posts):
        content += f"\nPost {idx}:\n"
        content += f"Post JSON: {json.dumps(post, ensure_ascii=False)}\n"
        content += ";;\n\n"

    content += "Please filter through and find the posts which refer to an event, and return a list of event descriptions in order for each relavant post (some posts may not correspond to an event, so can be ignored, while others may correspond to multiple events, so you should add multiple events to the list)."
    content += "If the timing is recurring, e.g. recurring weekly, just add 1 event for the next week. If an event's timing is TBC then just ignore the event."
    content += """Return in JSON format: 
    {
        index: number,
        name: string,
        location: string,
        dateTimeStart: dd/mm/yyyy hh:mm
        dateTimeEnd: dd/mm/yyyy hh:mm
        description: string
    }[]
    """

    response = OpenaiClient.chat.completions.create(
        model="gpt-5-mini",
        messages=[{"role": "user", "content": content}]
    )

    jsonString = response.choices[0].message.content.strip()
    if jsonString.startswith("```json") and jsonString.endswith("```"):
        jsonString = jsonString[7:-3]
    jsonResponse = json.loads(jsonString)
    
    #use index key to match image url from given posts
    for event in jsonResponse:
        try:
            event["imageURL"] = posts[event["index"]]["imageURL"]
            event["link"] = posts[event["index"]]["link"]
        except:
            event["imageURL"] = ""
            event["link"] = ""

        #now we need to remove index (key value pair) from the jsonResponse
        del event["index"]

    return jsonResponse
