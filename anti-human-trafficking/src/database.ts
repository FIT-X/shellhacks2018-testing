import { MongoClient, Db } from 'mongodb';

import { Person, Location, Report } from './types';

const debug = require('debug')('app:database');

export class Database {
    private db?: Db
    constructor(connectionString: string) {
        MongoClient.connect(connectionString, { useNewUrlParser: true }, (err, client) => {
            this.db = client.db();
        });
    }

    public createReport(report: Partial<Report>) {
        if (!this.db) throw new Error('no db');
        report.created = report.created || new Date().toISOString();
        const collection = this.db.collection('Reports');
        return collection.insertOne(report).then((value) => {
            console.log(value.insertedCount);
        });
    }

    public getReports() {
        if (!this.db) throw new Error('no db');
        const collection = this.db.collection('Reports');
        return collection.find().toArray();
    }

    public createLocation(location: Location) {
        if (!this.db) throw new Error('no db');
        location.created = location.created || new Date().toISOString();
        const collection = this.db.collection('Locations');
        return collection.insertOne(location);
    }

    public createPerson(person: Person) {
        if (!this.db) throw new Error('no db');
        person.created = person.created || new Date().toISOString();
        const collection = this.db.collection('Persons');
        return collection.insertOne(person)
    }
} 