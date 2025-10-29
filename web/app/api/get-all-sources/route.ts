import { NextResponse } from "next/server";
import { Source } from "@/app/interfaces";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    // Read all data from events.json
    const sourcesFilePath = path.join(process.cwd(), 'data', 'sources.json');
    const fileContents = fs.readFileSync(sourcesFilePath, 'utf-8');
    const allSources: Source[] = JSON.parse(fileContents);

    return NextResponse.json(allSources);
}
