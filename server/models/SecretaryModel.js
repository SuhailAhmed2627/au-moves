import mongoose from "mongoose";

const SecretarySchema = new mongoose.Schema({
  username: String,
  password: String,
});
const SecretaryModel = mongoose.model("secretary", SecretarySchema);

export { SecretaryModel };
