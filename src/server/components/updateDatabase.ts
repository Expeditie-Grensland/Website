import updateMediaFileAddRestricted from "./updates/updateMediaFileAddRestricted"
import updateWordsAudioFile from "./updates/updateWordsAudioFile"
import updateQuotesAddTime from "./updates/updateQuotesAddTime"

export default async function updateDatabase() {
    await updateMediaFileAddRestricted();
    await updateWordsAudioFile();
    await updateQuotesAddTime();
}
