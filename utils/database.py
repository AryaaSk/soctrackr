#epoch times are in seconds (since 1970-01-01 00:00:00 UTC)
# source types: instagram, whatsapp


#need to export table to json
import json

def ExportTableToJsonFile(cursor, tableName: str, filename: str):
    # Retrieve column names
    cursor.execute(f"PRAGMA table_info({tableName})")
    columns = [info[1] for info in cursor.fetchall()]
    # Retrieve data
    data = cursor.execute(f"SELECT * FROM {tableName}").fetchall()
    # Build list of dicts mapping column names to values
    data_dicts = [dict(zip(columns, row)) for row in data]
    with open(f"{filename}.json", "w") as f:
        json.dump(data_dicts, f)
    print(f"Exported {tableName} to {filename}.json")

# create database table if it doesn't exist
def CreateTables(cursor):
    # create table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        epochTimestampStart INTEGER NOT NULL,
        epochTimestampEnd INTEGER,
        notes TEXT,
        signUpRequired BOOLEAN,
        sourceIdentifier TEXT NOT NULL,
        sourceType TEXT NOT NULL,
        imageURL TEXT,
        link TEXT
    )
    """)

    # we also need tables to store sources, e.g. whatsapp groups, instagram accounts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        identifier TEXT NOT NULL,
        lastCheckedEpochTimestamp INTEGER NOT NULL
    )
    """)

def RetrieveSources(cursor, sourceType: str):
    cursor.execute("""
    SELECT identifier, lastCheckedEpochTimestamp FROM sources WHERE type = ?
    """, (sourceType,))
    return cursor.fetchall()

def AddEvent(cursor, conn, name: str, description: str, location: str, epochTimestampStart: int, epochTimestampEnd: int, notes: str, signUpRequired: bool, sourceIdentifier: str, sourceType: str, imageURL: str, link: str):
    cursor.execute("""
    INSERT INTO events (name, description, location, epochTimestampStart, epochTimestampEnd, notes, signUpRequired, sourceIdentifier, sourceType, imageURL, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, description, location, epochTimestampStart, epochTimestampEnd, notes, signUpRequired, sourceIdentifier, sourceType, imageURL, link))
    conn.commit()


def UpdateSourceLastCheckedTimestamp(cursor, conn, identifier: str, lastCheckedEpochTimestamp: int, sourceType: str):
    cursor.execute("""
    UPDATE sources SET lastCheckedEpochTimestamp = ? WHERE identifier = ? AND type = ?
    """, (lastCheckedEpochTimestamp, identifier, sourceType))
    conn.commit()

def AddSource(cursor, conn, identifier: str, sourceType: str, lastCheckedEpochTimestamp: int):
    # check if source already exists
    cursor.execute("""
    SELECT * FROM sources WHERE identifier = ? AND type = ?
    """, (identifier, sourceType))
    if cursor.fetchone():
        print(f"Source {identifier}, type {sourceType} already exists")
        return

    cursor.execute("""
    INSERT INTO sources (identifier, type, lastCheckedEpochTimestamp) VALUES (?, ?, ?)
    """, (identifier, sourceType, lastCheckedEpochTimestamp))
    conn.commit()