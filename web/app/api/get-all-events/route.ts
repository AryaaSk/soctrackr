import { NextResponse } from "next/server";
import { SocietyEvent } from "@/app/interfaces";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    const { currentEpoch } = await req.json();

    // Read all data from events.json
    const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');
    const fileContents = fs.readFileSync(eventsFilePath, 'utf-8');
    const allEvents: SocietyEvent[] = JSON.parse(fileContents);

    // Filter by epochTimestampStart
    const filterEpoch = currentEpoch - 3 * 3600; //include events 2 hours before current time
    const filteredEvents = allEvents.filter(
        (event) => Number(event.epochTimestampStart) > Number(filterEpoch)
    );

    return NextResponse.json(filteredEvents);
}
