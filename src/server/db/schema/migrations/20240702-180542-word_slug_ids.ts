/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from "kysely";

const generateId = (word: string): string =>
  word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/[гґ]/g, "g")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/ё/g, "yo")
    .replace(/є/g, "ie")
    .replace(/ж/g, "zh")
    .replace(/з/g, "z")
    .replace(/[иіїй]/g, "i")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "h")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "sch")
    .replace(/[ъь]/g, "")
    .replace(/ы/g, "y")
    .replace(/э/g, "je")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya")
    .replace(/æ/g, "ae")
    .replace(/[^0-9a-zа-я]+/g, "-");

export const up = async (db: Kysely<any>) => {
  // Word

  await db.schema
    .alterTable("word")
    .alterColumn("id", (col) => col.setDataType("text"))
    .alterColumn("id", (col) => col.dropDefault())
    .execute();

  const words = await db
    .selectFrom("word")
    .select(["id", "word", "definitions"])
    .execute();

  await Promise.all(
    words.map((word) =>
      db
        .updateTable("word")
        .set({
          id: generateId(word.word),
          definitions: word.definitions.map((definition: string) =>
            definition.replace(
              /\[([^\]]+)\]\(w\)/g,
              (_, desc) => `[${desc}](#${generateId(desc)})`
            )
          ),
        })
        .where("id", "=", word.id)
        .execute()
    )
  );

  await sql`DROP SEQUENCE "word_id_seq"`.execute(db);

  // Quote

  await db.schema
    .alterTable("quote")
    .alterColumn("id", (col) => col.setDataType("text"))
    .alterColumn("id", (col) => col.dropDefault())
    .execute();

  const quotes = await db.selectFrom("quote").select(["id", "quote"]).execute();

  await Promise.all(
    quotes.map((quote) =>
      db
        .updateTable("quote")
        .set({ id: generateId(quote.quote) })
        .where("id", "=", quote.id)
        .execute()
    )
  );

  await sql`DROP SEQUENCE "quote_id_seq"`.execute(db);

  // Afko

  await db.schema
    .alterTable("afko")
    .alterColumn("id", (col) => col.setDataType("text"))
    .alterColumn("id", (col) => col.dropDefault())
    .execute();

  const afkos = await db.selectFrom("afko").select(["id", "afko"]).execute();

  await Promise.all(
    afkos.map((afko) =>
      db
        .updateTable("afko")
        .set({ id: generateId(afko.afko) })
        .where("id", "=", afko.id)
        .execute()
    )
  );

  await sql`DROP SEQUENCE "afko_id_seq"`.execute(db);
};

export const down = async (db: Kysely<any>) => {
  // Word

  await sql`CREATE SEQUENCE "word_id_seq" AS integer`.execute(db);

  await db.schema
    .alterTable("word")
    .alterColumn("id", (col) =>
      col.setDataType(sql`integer USING nextval('word_id_seq'::regclass)`)
    )
    .alterColumn("id", (col) =>
      col.setDefault(sql`nextval('word_id_seq'::regclass)`)
    )
    .execute();

  await sql`ALTER SEQUENCE "word_id_seq" OWNED BY "word"."id"`.execute(db);

  const words = await db
    .selectFrom("word")
    .select(["id", "word", "definitions"])
    .execute();

  await Promise.all(
    words.map((word) =>
      db
        .updateTable("word")
        .set({
          definitions: word.definitions.map((definition: string) =>
            definition.replace(
              /\[([^\]]+)\]\(#[^)]+\)/g,
              (_, desc) => `[${desc}](w)`
            )
          ),
        })
        .where("id", "=", word.id)
        .execute()
    )
  );

  // Quote

  await sql`CREATE SEQUENCE "quote_id_seq" AS integer`.execute(db);

  await db.schema
    .alterTable("quote")
    .alterColumn("id", (col) =>
      col.setDataType(sql`integer USING nextval('quote_id_seq'::regclass)`)
    )
    .alterColumn("id", (col) =>
      col.setDefault(sql`nextval('quote_id_seq'::regclass)`)
    )
    .execute();

  await sql`ALTER SEQUENCE "quote_id_seq" OWNED BY "quote"."id"`.execute(db);

  // Afko

  await sql`CREATE SEQUENCE "afko_id_seq" AS integer`.execute(db);

  await db.schema
    .alterTable("afko")
    .alterColumn("id", (col) =>
      col.setDataType(sql`integer USING nextval('afko_id_seq'::regclass)`)
    )
    .alterColumn("id", (col) =>
      col.setDefault(sql`nextval('afko_id_seq'::regclass)`)
    )
    .execute();

  await sql`ALTER SEQUENCE "afko_id_seq" OWNED BY "afko"."id"`.execute(db);
};
