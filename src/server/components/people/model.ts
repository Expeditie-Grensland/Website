import mongoose, { Schema, InferSchemaType } from "mongoose";

import { PersonId } from "./id.js";

const personSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  initials: { type: String, required: true },
  userName: { type: String, required: true },
  ldapId: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  team: {
    type: String,
    enum: ["Blauw", "Rood"],
  },
});

personSchema.index({ lastName: 1, firstName: 1 });
personSchema.index({ userName: 1 });

export type Person = InferSchemaType<typeof personSchema>;

export const PersonModel = mongoose.model(PersonId, personSchema);
