import { PersonModel } from '../components/people/model';

export default async () => {
    await PersonModel.findOneAndUpdate({ name: 'Martijn Atema' }, { $set: { team: 'Blauw' } });
    await PersonModel.findOneAndUpdate({ name: 'Maurice Meedendorp' }, { $set: { team: 'Blauw' } });
    await PersonModel.findOneAndUpdate({ name: 'Martijn Bakker' }, { $set: { team: 'Blauw' } });
    await PersonModel.findOneAndUpdate({ name: 'Diederik Blaauw' }, { $set: { team: 'Rood' } });
    await PersonModel.findOneAndUpdate({ name: 'Ronald Kremer' }, { $set: { team: 'Rood' } });
    await PersonModel.findOneAndUpdate({ name: 'Matthijs Nuus' }, { $set: { team: 'Rood' } });
}
