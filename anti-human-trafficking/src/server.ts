import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Person, TraffickingType, Location, PersonType } from './types';

import { Database } from './database';

const settings = require('../settings.json');
const db = new Database(settings.connection_string);

const debug = require('debug')('app:server');

import { Report } from './types';
import { ObjectId } from 'bson';

const PORT = process.env.PORT || 3000;

const app = express()

app.use(bodyParser.json())

interface ReportBody {
    victim: Person[],
    observedDate: string,
    location: Location,
    contact: Person,
    traffickingType: TraffickingType,
}

app.post('/report', (req, res) => {
    const report: ReportBody = req.body;
    if (!report ||
        !report.victim ||
        !report.observedDate ||
        !report.location ||
        !report.contact ||
        !report.traffickingType
    ) {
        res.statusCode = 400;
        res.send('Missing parameter');
        return;
    }
    debug(report);
    let victimIds: ObjectId[] = [];
    let contactId: ObjectId;
    let locationId: ObjectId;
    Promise.all(report.victim.map(victim => {
        victim.type = PersonType.victim
        return db.createPerson(victim);
    })).then((results) => {
        victimIds = results.map(result => result.insertedId);
        report.contact.type = PersonType.reporter;
        return db.createPerson(report.contact);
    }).then((result) => {
        contactId = result.insertedId;
        return db.createLocation(report.location);
    }).then((result) => {
        locationId = result.insertedId;
        const reportPartial: Partial<Report> = {
            victimId: victimIds,
            observedDate: report.observedDate,
            locationId: locationId,
            contactId: contactId,
            traffickingType: report.traffickingType
        }
        return db.createReport(reportPartial);
    }).then(() => {
        return res.send('Report accepted!');
    });
});

const auth: express.Handler = (res, req, next) => {
    next();
}

app.get('/reports', auth, (req, res) => {
    db.getReports().then((reports) => {
        return res.send({ items: reports });
    })
});

app.get('/victims', auth, (req, res) => {
    return res.send('Hello World!');
});

app.post('/media', auth, (req, res) => {
    return res.send('Hello World!');
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))