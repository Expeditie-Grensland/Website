import { Metadata } from '../components/metadata';

const DATABASE_VERSION_KEY = 'database_version';

const UPDATES = [
    { // 0 -> 1
        info: 'Add restricted property to media files',
        func: require('./update000MediaFileAddRestricted')
    },
    { // 1 -> 2
        info: 'Change audioFile property to mediaFile for words',
        func: require('./update001WordsAudioFile')
    },
    { // 2 -> 3
        info: 'Add time property to quotes',
        func: require('./update002QuotesAddTime')
    },
    { // 3 -> 4
        info: 'Add team property to people',
        func: require('./update003SetPersonTeams')
    },
    { // 4 -> 5
        info: 'Populate earned points collection',
        func: require('./update004PopulatePoints')
    }
];

async function performUpdate(version: number, update: { info: string, func: any }) {
    console.info(`Database update ${version} -> ${version + 1}: ${update.info}`);
    await update.func.default();
}

export default async function updateDatabase() {
    let databaseVersion = <number | null> await Metadata.getValueByKey(DATABASE_VERSION_KEY);

    if (databaseVersion === null)
        databaseVersion = <number>(await Metadata.createKeyValue(DATABASE_VERSION_KEY, UPDATES.length)).value;

    const updatesToPerform = UPDATES.slice(databaseVersion);

    for (let update of updatesToPerform)
        await performUpdate(databaseVersion++, update);

    console.log(`Database version: ${databaseVersion}`);

    if (updatesToPerform.length != 0)
        await Metadata.setValue(DATABASE_VERSION_KEY, databaseVersion);
}
