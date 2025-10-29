# run script as often as convenient, for example every hour or day

# checks all sources for new events, if any are found, add them to the database
# will use sqlite3 for database

# also need to create a user interface for users to view events, i.e. just lookup in databse

import sqlite3
from utils.database import *
from utils.dates import *
from sources import InstagramSourceChecker

def UpdateEvents(cursor, conn, sourceType: str):
    # retrieve all instagram sources
    instagramSources = RetrieveSources(cursor, sourceType) # (identifier, lastCheckedEpochTimestamp)
    
    todayDate = (datetime.datetime.now() - datetime.timedelta(hours=0)).strftime("%d/%m/%Y")
    nowEpoch = int((datetime.datetime.now() - datetime.timedelta(hours=0)).timestamp())

    instagramSourceChecker = InstagramSourceChecker()

    for identifier, lastCheckedEpochTimestamp in instagramSources:
        lastCheckedDateTime = ConvertEpochToDateTime(lastCheckedEpochTimestamp) #format dd/mm/yyyy
        lastCheckedDate = lastCheckedDateTime.split(" ")[0]

        print(f"Checking {identifier} for new events since {lastCheckedDate}")
        if lastCheckedDate == todayDate: #skip if already checked source today
            continue

        #returns in format {name: string, location: string, dateTimeStart: dd/mm/yyyy hh:mm, dateTimeEnd: dd/mm/yyyy hh:mm, description: string, imageURL: string}[]
        newEvents = instagramSourceChecker.CheckForNewEvents(identifier, lastCheckedDate)

        #add new events to database, generalisable to all sources
        for event in newEvents:
            name = event["name"]
            location = event["location"]
            dateTimeStart = event["dateTimeStart"]
            dateTimeEnd = event["dateTimeEnd"]
            description = event["description"]
            imageURL = event["imageURL"]
            link = event["link"]

            epochTimestampStart = ConvertDateTimeToEpoch(dateTimeStart) if dateTimeStart != "" else ""
            epochTimestampEnd = ConvertDateTimeToEpoch(dateTimeEnd) if dateTimeEnd != "" else ""

            AddEvent(cursor, conn, name, description, location, epochTimestampStart, epochTimestampEnd, "", False, identifier, "instagram", imageURL, link)

        #update source's last checked date
        UpdateSourceLastCheckedTimestamp(cursor, conn, identifier, nowEpoch, "instagram")
        print(f"Updated {identifier}'s last checked date to {todayDate}")

def Main():
    conn = sqlite3.connect('data/events.db')
    cursor = conn.cursor()

    CreateTables(cursor) #will create table if it doesn't exist

    oct4Epoch = ConvertDateTimeToEpoch("04/10/2025 00:00")
    #print(oct4Epoch)

    # AddSource(cursor, conn, "180dc.cambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cutamilsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuindiasoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cutec.io", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeentrepreneurs", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeconsultingsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgetradingsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cufisoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cibsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgemedtech", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "aiinmedicinesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camuni3d", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "aiandentrepreneurshipsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camblockchains", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "archimedeans", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuabc_1", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeamericansoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridge_assassins_guild", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuafc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camastrosoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniathleticsclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "c.u.badminton", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu.banglasoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversity_baseball", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuwbbc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgecubiss", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "bigbandroulette", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "biosoc.cam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cubiotech", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cubollywoodtroupe", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camuniarchery", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversitybjj", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "breadtheatreandfilm", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cam.bubbletea", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "Bbmscambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camfm972", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuneurosciencesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeunion", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeunidancesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cam.uni.canoe.club", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cucaribbeansa", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuces.ceb", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversitychessclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "medicsofcambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "clubitalia_cambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgenegotiationsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "uccps_", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cucats.cam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "unicambridgeconcertband", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "bluescricket", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgesailingteam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuetonfives", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cugastrosoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cujo_bigband", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camunimussoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeurdusoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversitycubansalsa", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camcubingclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cucybersociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversitycyclingclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camdancesport", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgedermsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camdancesport", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camdigitalartsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camdigitalgaming", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgedna", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cudj", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camdocsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cudronesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuedsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuendocrinesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuets_cam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuengsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "ewbcambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_ethicalfinance", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "ethicsinmathematics", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cueus", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuexofficial", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "fersacambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "c_u_f_c", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cufilmassociation", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cudevs", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgegpsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cugstagram", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "gatescambridgescholars", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "germansociety.cam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgebluesgolf", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeunihandball", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgehandsonscience", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuhmsofficial", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuhiphopsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "CUIHC1885", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camimmunesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "impronauts", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cibsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_isoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeitalian", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cujapanesesociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camjazzsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridge_jitsu", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cj.humanbehaviour", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridge_judo", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cujugglersassociation", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cukabaddiclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridge_uni_karate_club", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "tsurugibashi", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cukeralasoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuks_cambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cukpopsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cukuthusoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "culacrosseclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "culanguagesandculture", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgelawsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cultc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camunimatsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cumedbrigades", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu.mhs", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgemedsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeunimma", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeunipentathlon", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cumcofficial", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "lightbluegym", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridge_paksoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camphysoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgeuniversitypoloclub", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuplc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "campsychsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgepsychsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "CambridgeUniPunjabiSociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camquizsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgerds", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "reachsci", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "curefis.cam", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu.recorder.ensemble", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "remoncampuscambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu.rpc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_rhythmandvibez", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_robotics", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "trinitycollegefoosballsociety", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgerugbyfives", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_robotics", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgescisoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cusikhsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cu_neurosurgsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camsocsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuspanishsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgesemsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cusquash", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "studentmindscambridge", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camunitc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camtravelsoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cutric", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cambridgevalueinvesting", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "cuwinesoc", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "camworldcinema", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "trinity_ents", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "stjohnsents", "instagram", oct4Epoch)
    # AddSource(cursor, conn, "kings.ents", "instagram", oct4Epoch)

    UpdateEvents(cursor, conn, "instagram")

    ExportTableToJsonFile(cursor, "events", "web/data/events")
    ExportTableToJsonFile(cursor, "sources", "web/data/sources")

    cursor.close()
    conn.close()

Main()

#$3.45 before updating; $4.02 after updating
#add filters for specific genres, e.g. sports, music, STEM, etc...
#could be done by grouping societies together