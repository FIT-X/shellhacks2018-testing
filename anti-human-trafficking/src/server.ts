import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Person, TraffickingType, Location, PersonType, Account } from './types';

import { Database } from './database';

const settings = require('../settings.json');
const db = new Database(process.env.CONNECTION_STRING || settings.connection_string);

const debug = require('debug')('app:server');

import { Report } from './types';
import { ObjectId } from 'bson';

const PORT = process.env.PORT || 3000;

const app = express()

app.use(bodyParser.json())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

const auth: express.Handler = (req, res, next) => {
    debug('Auth')
    if (!req.headers['authorization']) {
        res.statusCode = 400;
        return res.send('Not authenticated');
    }
    db.status(req.headers['authorization'] as string).then((result) => {
        (<any>req).accountId = result.accountId;
        debug(result)
        next();
    }).catch(err => {
        debug(err);
        res.statusCode = 400;
        return res.send('Not authenticated');
    })
}

app.get('/reports', auth, (req, res) => {
    db.getReports().then((reports) => {
        return res.send({ items: reports });
    })
});

app.get('/victims', auth, (req, res) => {
    return res.send('Hello World!');
});

app.post('/account', (req, res) => {
    const body: Partial<Account> = req.body;
    if (!body.username ||
        !body.passwordHash) {
        res.statusCode = 400;
        return res.send('Missing parameter');
    }
    debug(body);
    db.createAccount({
        username: body.username,
        passwordHash: body.passwordHash
    }).then((result) => {
        return res.send('Account created!');
    }).catch(() => {
        res.statusCode = 400;
        return res.send('Account already exists');
    });
});

app.post('/login', (req, res) => {
    const body: Partial<Account> = req.body;
    if (!body.username ||
        !body.passwordHash) {
        res.statusCode = 400;
        return res.send('Missing parameter');
    }
    debug(body);
    db.login({
        username: body.username,
        passwordHash: body.passwordHash
    }).then((result) => {
        debug(result);
        return res.send({ token: result.token });
    }).catch(() => {
        res.statusCode = 400;
        return res.send('Incorrect credentials');
    });
});

app.get('/status', auth, (req, res) => {
    debug((<any>req).accountId)
    db.getAccount((<any>req).accountId).then(result => {
        return res.send({
            username: result.username,
            created: result.created
        });
    }).catch(err => {
        res.statusCode = 400;
        return res.send('Error');
    })
});

app.post('/media', auth, (req, res) => {
    return res.send('Hello World!');
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))