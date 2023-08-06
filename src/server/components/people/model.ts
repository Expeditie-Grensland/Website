import { InferSchemaType, Schema, model } from "mongoose";

import { PersonId } from "./id.js";

const personSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  initials: { type: String, required: true },
  sortingName: { type: String, required: true },
  userName: { type: String, required: true },
  ldapId: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["member", "guest"],
    required: true,
  },
  team: {
    type: String,
    enum: ["Blauw", "Rood"],
  },
});

personSchema.index({ userName: 1 });
personSchema.index({ ldapId: 1 });
personSchema.index({ sortingName: 1 });
personSchema.index({ type: -1, sortingName: 1 });

export type Person = InferSchemaType<typeof personSchema>;

export const PersonModel = model(PersonId, personSchema);
