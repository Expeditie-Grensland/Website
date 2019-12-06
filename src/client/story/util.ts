import moment from 'moment';

export namespace Util {
    moment.locale('NL');

    export function unixTimeToDisplayDate(timeMs: number): string {
        const then = moment(timeMs);
        const now = moment();

        if (now.diff(then, 'hours', true) <= 24)
            return then.fromNow();
        else if (now.diff(then, 'hours', true) < 48)
            return 'gisteren om ' + then.format('hh:mm');
        else if (now.diff(then, 'years', true) < 1)
            return then.format('DD MMMM');

        return moment(timeMs).format('DD MMMM YYYY');
    }

    export function unixTimeToTitleDate(timeMs: number): string {
        return moment(timeMs).format('DD/MM/YYYY, hh:mm');
    }
}
