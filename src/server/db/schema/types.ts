/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type PersonTeam = "blue" | "green" | "red";

export type PersonType = "admin" | "former" | "guest" | "member";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Afko {
  afko: string;
  attachment_file: string | null;
  definitions: Generated<string[]>;
  id: string;
}

export interface EarnedPoint {
  amount: number;
  expeditie_id: string | null;
  id: Generated<number>;
  person_id: string;
  team: PersonTeam;
  time_stamp: number;
  time_zone: string;
}

export interface Expeditie {
  background_file: string | null;
  countries: Generated<string[]>;
  draft: Generated<boolean>;
  end_date: Timestamp;
  id: string;
  movie_file: string | null;
  movie_restricted: Generated<boolean>;
  name: string;
  show_map: Generated<boolean>;
  start_date: Timestamp;
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
  batch: string;
  id: Generated<number>;
  latitude: number;
  longitude: number;
  node_id: number;
  time_stamp: number;
  time_zone: string;
}

export interface GeoNode {
  color: string;
  description: string | null;
  expeditie_id: string;
  id: Generated<number>;
  position_part: Generated<number>;
  position_total: Generated<number>;
}

export interface GeoNodeEdge {
  child_id: number;
  parent_id: number;
}

export interface GeoNodePerson {
  node_id: number;
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
  email: string | null;
  first_name: string;
  id: string;
  initials: string;
  last_name: string;
  password: string | null;
  sorting_name: string;
  team: PersonTeam | null;
  type: PersonType;
}

export interface PersonAddress {
  country: string;
  id: Generated<number>;
  line_1: string;
  line_2: string;
  name: string | null;
  person_id: string;
}

export interface Quote {
  attachment_file: string | null;
  context: string;
  id: string;
  quote: string;
  quotee: string;
  time_stamp: number;
  time_zone: string;
}

export interface Story {
  id: Generated<number>;
  node_id: number;
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
  id: string;
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
  geo_node_edge: GeoNodeEdge;
  geo_node_person: GeoNodePerson;
  member_link: MemberLink;
  person: Person;
  person_address: PersonAddress;
  quote: Quote;
  story: Story;
  story_media: StoryMedia;
  word: Word;
}
