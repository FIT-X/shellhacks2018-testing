import { ObjectId } from 'mongodb';
// export enum CaseStatus {
//     open = 'open',
//     closed = 'closed',
//     active = 'active'
// }

// export interface Case {
//     id?: ObjectId,
//     victimId?: string,
//     status: CaseStatus,
//     updated: string,
//     created: string
// }

export interface Location {
    id?: ObjectId,
    city: string,
    state: string,
    address: string
    description?: string,
    created: string
}

export enum PersonType {
    victim = 'victim',
    reporter = 'reporter',
}

export interface Person {
    id?: ObjectId,
    type: PersonType,
    name?: string,
    age?: number,
    gender?: string,
    ethnicity?: string,
    phoneNumber?: string,
    description: string,
    created: string
}

export enum TraffickingType {
    labor = 'labor',
    sex = 'sex',
    other = 'other',
    unknown = 'unknown',
}

export interface Report {
    id: ObjectId,
    victimId: ObjectId[],
    observedDate: string,
    locationId: ObjectId,
    contactId: ObjectId,
    traffickingType: TraffickingType,
    created: string
}   


export interface Account {
    id: ObjectId,
    username: string,
    passwordHash: string,
    created: string
}