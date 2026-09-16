"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = baseModel;
