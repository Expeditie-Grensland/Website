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
    },
    { // 5 -> 6
        info: 'Remove mediaFile uses',
        func: require('./update005RemoveFileUses')
    },
    { // 6 -> 7
        info: 'Remove expedities from people',
        func: require('./update006RemovePeopleExpedities')
    },
    { // 7 -> 8
        info: 'Update strings to ObjectIds',
        func: require('./update007ChangeToObjectId')
    },
    { // 8 -> 9
        info: 'Replace expeditie background files',
        func: require('./update008ReplaceImages')
    },
    { // 9 -> 10
        info: 'Remove duplicate locations',
        func: require('./update009RemoveDuplicates')
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
