const httpMessages: Record<number, string> = {
  0: "Onbekende fout",
  400: "Foute aanvraag",
  401: "Niet geautoriseerd",
  403: "Verboden toegang",
  404: "Niet gevonden",
  405: "Methode niet toegestaan",
  406: "Niet aanvaardbaar",
  500: "Interne serverfout",
  501: "Niet geïmplementeerd",
};

export const getHttpMessage = (code = 500) => {
  if (code >= 500) return httpMessages[code] || httpMessages[500];

  if (code >= 400) return httpMessages[code] || httpMessages[400];

  return httpMessages[0];
};
