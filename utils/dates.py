import datetime
import pytz

#takes in format dd/mm/yyyy hh:mm and returns epoch timestamp
def ConvertDateTimeToEpoch(dateTime: str) -> int:
    # Assume GMT (Greenwich Mean Time) - UTC+0
    dt_gmt = datetime.datetime.strptime(dateTime, "%d/%m/%Y %H:%M")
    gmt = pytz.timezone("Etc/GMT")
    dt_gmt = gmt.localize(dt_gmt)
    dt_utc = dt_gmt.astimezone(pytz.utc)
    return int(dt_utc.timestamp())

def ConvertEpochToDateTime(epoch: int) -> str:
    return datetime.datetime.fromtimestamp(epoch).strftime("%d/%m/%Y %H:%M")