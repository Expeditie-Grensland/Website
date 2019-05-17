import moment from 'moment';
import 'moment/locale/nl';

export namespace Util {
    export function unixTimeToDisplayDate(timeMs: number): string {
        const then = moment(timeMs);
        const now = moment();

        if (now.diff(then, 'hours', true) <= 24)
            return then.locale("NL").fromNow();
        else if (now.diff(then, 'hours', true) < 48)
            return "gisteren om " + then.format('hh:mm');
        else if (now.diff(then, 'years', true) < 1)
            return then.locale('NL').format('DD MMMM');

        return moment(timeMs).locale('NL').format('DD MMMM YYYY');
    }

    export function unixTimeToTitleDate(timeMs: number): string {
        return moment(timeMs).locale('NL').format('DD/MM/YYYY, hh:mm');
    }
}
