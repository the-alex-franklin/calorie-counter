import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ✅ Base Type: Both `_id: ObjectId` and `id: string`
export type BaseDocument = Document & {
	_id: Types.ObjectId; // For MongoDB queries
	id: string; // Always available as a string
};

// ✅ Abstract Base Model (automates `_id → id` conversion)
export abstract class BaseModel<T extends BaseDocument> {
	public model: Model<T>;

	constructor(name: string, schema: Schema<T>) {
		// ✅ Convert `_id` to `id` in `.toJSON()`
		schema.set("toJSON", {
			transform: (_, ret) => {
				ret.id = ret._id.toString(); // Convert `_id` to `id`
				delete ret.password;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		});

		// ✅ Convert `_id` to `id` in `.toObject()`
		schema.set("toObject", {
			transform: (_, ret) => {
				ret.id = ret._id.toString(); // Convert `_id` to `id`
				delete ret.password;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		});

		this.model = mongoose.model<T>(name, schema);
	}
}
