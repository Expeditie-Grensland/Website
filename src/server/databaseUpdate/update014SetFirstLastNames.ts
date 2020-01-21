import { PersonModel } from '../components/people/model';
import { People } from '../components/people';

export default async () => {
    const people = await People.getAll();

    await PersonModel.collection.updateMany({}, { $unset: { name: true } });

    people.forEach(person => {
        const name = person.toObject().name.split(' ');

        person.firstName = name[0];
        person.lastName = name[1];
        person.initials = name[0][0] + '.';
        person.userName = name[0].toLowerCase() + '.' + name[1].toLowerCase();

        person.save();
    });
}
