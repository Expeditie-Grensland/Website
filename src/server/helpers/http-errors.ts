export const httpErrors: Record<number, string> = {
  0: "Onbekende fout",
  400: "Foute aanvraag",
  401: "Niet geautoriseerd",
  403: "Verboden toegang",
  404: "Niet gevonden",
  405: "Methode niet toegestaan",
  406: "Niet aanvaardbaar",
  500: "Interne serverfout",
  501: "Niet geïmplementeerd",
  502: "Slechte gateway",
  503: "Dienst niet beschikbaar",
  504: "Gateway timeout",
};

export const getHttpError = (code = 500) => {
  if (code >= 500) return httpErrors[code] || httpErrors[500];
  if (code >= 400) return httpErrors[code] || httpErrors[400];

  return httpErrors[0];
};
