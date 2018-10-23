export const ready = (callback: () => void) => {
    if (document.readyState != 'loading')
        callback();
    else if (document.addEventListener)
        document.addEventListener('DOMContentLoaded', callback);
    else
        document.onreadystatechange = () => {
            if (document.readyState == 'complete') callback();
        };
};
