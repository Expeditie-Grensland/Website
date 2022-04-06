import { Metadata } from '../components/metadata';

const DATABASE_VERSION_KEY = 'database_version';

const UPDATES: {info: string, func: any}[] = [
    { // 0 -> 1
        info: 'Add restricted property to media files',
        func: {}
    },
    { // 1 -> 2
        info: 'Change audioFile property to mediaFile for words',
        func: {}
    },
    { // 2 -> 3
        info: 'Add time property to quotes',
        func: {}
    },
    { // 3 -> 4
        info: 'Add team property to people',
        func: {}
    },
    { // 4 -> 5
        info: 'Populate earned points collection',
        func: {}
    },
    { // 5 -> 6
        info: 'Remove mediaFile uses',
        func: {}
    },
    { // 6 -> 7
        info: 'Remove expedities from people',
        func: {}
    },
    { // 7 -> 8
        info: 'Update strings to ObjectIds',
        func: {}
    },
    { // 8 -> 9
        info: 'Replace expeditie background files',
        func: {}
    },
    { // 9 -> 10
        info: 'Remove duplicate locations',
        func: {}
    },
    { // 10 -> 11
        info: 'Remove visualArea from GeoLocations',
        func: {}
    },
    { // 11 -> 12
        info: 'Set isAdmin to true for admins',
        func: {}
    },
    { // 12 -> 13
        info: 'Us Luxon DateTime for dates/times',
        func: {}
    },
    { // 13 -> 14
        info: 'Unset color field for expedities',
        func: {}
    },
    { // 14 -> 15
        info: 'Separate names into first and last names',
        func: {}
    },
    { // 15 -> 16
        info: 'Remove expeditie movie file names from database',
        func: {}
    }
];

async function performUpdate(version: number, update: { info: string, func: any }) {
    console.info(`Database update ${version} -> ${version + 1}: ${update.info}`);
    await update.func.default();
}

export default async function updateDatabase() {
    let databaseVersion = <number | null>await Metadata.getValueByKey(DATABASE_VERSION_KEY);

    if (databaseVersion === null)
        databaseVersion = <number>(await Metadata.createKeyValue(DATABASE_VERSION_KEY, UPDATES.length)).value;

    const updatesToPerform = UPDATES.slice(databaseVersion);

    for (let update of updatesToPerform)
        await performUpdate(databaseVersion++, update);

    console.log(`Database version: ${databaseVersion}`);

    if (updatesToPerform.length != 0)
        await Metadata.setValue(DATABASE_VERSION_KEY, databaseVersion);
}
