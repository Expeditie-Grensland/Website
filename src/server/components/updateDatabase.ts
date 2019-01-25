import updateMediaFileAddRestricted from "./updates/updateMediaFileAddRestricted"
import updateWordsAudioFile from "./updates/updateWordsAudioFile"

export default async function updateDatabase() {
    await updateMediaFileAddRestricted();
    await updateWordsAudioFile();
}
