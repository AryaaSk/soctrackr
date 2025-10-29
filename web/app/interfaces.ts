export interface SocietyEvent {
    id: number;
    name: string;
    description: string;
    location: string;
    epochTimestampStart: number;
    epochTimestampEnd?: number;
    notes?: string;
    signUpRequired?: boolean;
    sourceIdentifier: string;
    sourceType: "instagram";
    imageURL?: string;
    link?: string;
}

export interface Source {
    id: number;
    identifier: string;
    type: "instagram";
    lastCheckedEpochTimestamp: number;
}