import { People } from '../components/people';

export default async () => {
    const martijn = await People.getByName('Martijn Atema');
    const maurice = await People.getByName('Maurice Meedendorp');

    await People.setIsAdmin(martijn!, true);
    await People.setIsAdmin(maurice!, true);
}
