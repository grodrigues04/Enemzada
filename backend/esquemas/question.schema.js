import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
	{
		id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		question: {
			numero: { type: Number, required: true },
			ano: { type: Number, required: true },
			url: { type: String, required: true }
		},
		tentativa: {
			data: { type: Date, required: true },
			resultado: { type: Boolean, required: true }
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'question'
	}
);

export default questionSchema;