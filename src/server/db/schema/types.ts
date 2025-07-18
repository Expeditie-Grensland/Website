/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type GeoSegmentType = "flight" | "normal";

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
  segment_id: number;
  time_stamp: number;
  time_zone: string;
}

export interface GeoSegment {
  color: string;
  description: string | null;
  expeditie_id: string;
  id: Generated<number>;
  position_part: Generated<number>;
  position_total: Generated<number>;
  type: Generated<GeoSegmentType>;
}

export interface GeoSegmentLink {
  child_id: number;
  parent_id: number;
}

export interface GeoSegmentPerson {
  person_id: string;
  segment_id: number;
}

export interface MemberLink {
  description: Generated<string>;
  id: Generated<number>;
  index: number;
  title: string;
  url: string;
}

export interface MemberWriting {
  description: Generated<string>;
  id: string;
  index: number;
  text: string;
  title: string;
}

export interface Packlist {
  default: Generated<boolean>;
  id: string;
  name: string;
  position: number;
}

export interface PacklistItem {
  description: string | null;
  id: Generated<number>;
  name: string;
  packlist_id: string;
  position: number;
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
  segment_id: number;
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
  geo_segment: GeoSegment;
  geo_segment_link: GeoSegmentLink;
  geo_segment_person: GeoSegmentPerson;
  member_link: MemberLink;
  member_writing: MemberWriting;
  packlist: Packlist;
  packlist_item: PacklistItem;
  person: Person;
  person_address: PersonAddress;
  quote: Quote;
  story: Story;
  story_media: StoryMedia;
  word: Word;
}
