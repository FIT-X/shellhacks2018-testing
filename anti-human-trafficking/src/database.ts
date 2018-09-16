import * as crypto from 'crypto';

import { MongoClient, Db, ObjectId } from 'mongodb';

import { Person, Location, Report, Account, Media } from './types';

const debug = require('debug')('app:database');

export class Database {
    private db?: Db
    constructor(connectionString: string) {
        MongoClient.connect(connectionString, { useNewUrlParser: true }, (err, client) => {
            this.db = client.db();
            this.db.createIndex('Accounts', 'username', { unique: true }, () => debug('index created')); // Ensure that usernames are unique
            this.db.createIndex('Tokens', 'token', { unique: true }, () => debug('index created')); // Ensure that generated tokens are unique
            this.db.createIndex('Tokens', 'created', { expireAfterSeconds: 60 * 10 }, () => debug('index created')); // Expire tokens after 10 min
        });
    }

    public createAccount(account: Partial<Account>) {
        if (!this.db) throw new Error('no db');
        if (!account.username || !account.passwordHash) throw new Error('Missing credential');
        const collection = this.db.collection('Accounts');
        // Password-Based Key Derivation Function 2
        // https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
        const derivedKey = crypto.pbkdf2Sync(account.passwordHash, account.username, 200000, 128, 'sha512');
        account.passwordHash = derivedKey.toString('hex');
        account.created = account.created || new Date().toISOString();
        return collection.insertOne(account);
    }

    public login(account: Partial<Account>) {
        if (!this.db) throw new Error('no db');
        const collection = this.db.collection('Accounts');
        const tokens = this.db.collection('Tokens');
        if (!account.username || !account.passwordHash) throw new Error('Missing credential');
        // Password-Based Key Derivation Function 2
        // https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
        const derivedKey = crypto.pbkdf2Sync(account.passwordHash, account.username, 200000, 128, 'sha512');
        return collection.findOne({ username: account.username, passwordHash: derivedKey.toString('hex') }).then(result => {
            if (!result) return debug('could not find account');
            debug('Creating token')
            return tokens.insert({
                token: crypto.randomBytes(256).toString('hex'),
                accountId: result._id,
                created: new Date().toISOString()
            }).then((insert) => {
                if (insert.insertedCount == 0) throw new Error('Could not create token');
                debug(insert.result);
                return Promise.resolve(insert.ops[0]);
            });
        })
    }

    public getAccount(accountId: ObjectId) {
        if (!this.db) throw new Error('no db');
        const collection = this.db.collection('Accounts');
        return collection.findOne({ _id: accountId }).then(result => {
            if (!result) return debug('could not find account');
            return Promise.resolve(result);
        })
    }

    public status(token: string) {
        if (!this.db) throw new Error('no db');
        const collection = this.db.collection('Tokens');
        return collection.findOne({ token: token }).then(result => {
            if (!result) return debug('could not find token');
            debug('Creating token')
            return Promise.resolve(result);
        })
    }

    public createReport(report: Partial<Report>) {
        if (!this.db) throw new Error('no db');
        report.created = report.created || new Date().toISOString();
        const collection = this.db.collection('Reports');
        return collection.insertOne(report);
    }

    public getReports() {
        if (!this.db) throw new Error('no db');
        const collection = this.db.collection('Reports');
        return collection.find<Report>().toArray();
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

    public createMedia(media: Partial<Media>) {
        if (!this.db) throw new Error('no db');
        media.created = media.created || new Date().toISOString();
        const collection = this.db.collection('Media');
        return collection.insertOne(media)
    }
} 