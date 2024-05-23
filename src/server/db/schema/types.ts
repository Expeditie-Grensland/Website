import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type PersonTeam = "b" | "r";

export type PersonType = "admin" | "guest" | "member";

export interface Afko {
  afko: string;
  attachment_file: string | null;
  definitions: Generated<string[]>;
  id: Generated<number>;
}

export interface EarnedPoint {
  amount: number;
  expeditie_id: string | null;
  id: Generated<number>;
  person_id: string;
  time_stamp: number;
  time_zone: string;
}

export interface Expeditie {
  background_file: string | null;
  countries: Generated<string[]>;
  id: string;
  movie_file: string | null;
  movie_restricted: Generated<boolean>;
  name: string;
  sequence_number: number;
  show_map: Generated<boolean>;
  subtitle: string;
}

export interface ExpeditieMovieEditor {
  expeditie_id: string;
  person_id: string;
}

export interface ExpeditiePerson {
  expeditie_id: string;
  person_id: string;
}

export interface GeoLocation {
  altitude: number | null;
  expeditie_id: string;
  id: Generated<number>;
  latitude: number;
  longitude: number;
  person_id: string;
  time_stamp: number;
  time_zone: string;
}

export interface GeoNode {
  expeditie_id: string;
  id: Generated<number>;
  time_from: Generated<number>;
  time_till: Generated<number>;
}

export interface GeoNodePerson {
  geo_node_id: number;
  person_id: string;
}

export interface MemberLink {
  description: Generated<string>;
  id: Generated<number>;
  index: number;
  title: string;
  url: string;
}

export interface Person {
  first_name: string;
  id: string;
  initials: string;
  last_name: string;
  password: string | null;
  sorting_name: string;
  team: PersonTeam | null;
  type: PersonType;
}

export interface Quote {
  attachment_file: string | null;
  context: string;
  id: Generated<number>;
  quote: string;
  quotee: string;
  time_stamp: number;
  time_zone: string;
}

export interface Story {
  expeditie_id: string;
  id: Generated<number>;
  person_id: string;
  text: string | null;
  time_stamp: number;
  time_zone: string;
  title: string;
}

export interface StoryMedia {
  description: Generated<string>;
  file: string;
  id: Generated<number>;
  story_id: number;
}

export interface Word {
  attachment_file: string | null;
  definitions: Generated<string[]>;
  id: Generated<number>;
  phonetic: string | null;
  word: string;
}

export interface DB {
  afko: Afko;
  earned_point: EarnedPoint;
  expeditie: Expeditie;
  expeditie_movie_editor: ExpeditieMovieEditor;
  expeditie_person: ExpeditiePerson;
  geo_location: GeoLocation;
  geo_node: GeoNode;
  geo_node_person: GeoNodePerson;
  member_link: MemberLink;
  person: Person;
  quote: Quote;
  story: Story;
  story_media: StoryMedia;
  word: Word;
}
