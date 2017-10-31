import {TableData, Tables} from "./Tables"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument

export namespace Expeditie {

    let expedities: Promise<ExpeditieDocument[]> = null

    export function getExpedities(): Promise<ExpeditieDocument[]> {
        if(expedities == null) {
            const query = Tables.Expeditie.find({}).sort({sequence_number: 1})

            expedities = new Promise((resolve, reject) => {
                query.then((res) => resolve(res))
                query.catch((err) => reject(err))
            });
        }
        return new Promise((resolve) => {
            resolve(expedities);
        });
    }

    export function createExpeditie(name, nameShort, sequenceNumber, subtitle, color, participants, countries): Promise<ExpeditieDocument> {
        return Tables.Expeditie.create(<TableData.Expeditie.Expeditie>{
            name: name,
            nameShort: nameShort,
            sequenceNumber: sequenceNumber,
            subtitle: subtitle,
            color: color,
            participants: participants,
            countries: countries
        })
    }
}