const baseModel = {
	createdAt: {
		type: Number,
		default: Date.now,
		required: true,
	},
	updatedAt: {
		type: Number,
		default: Date.now,
		required: true,
	},
	deletedAt: {
		type: Number,
		required: false,
	},
};

export default baseModel;
