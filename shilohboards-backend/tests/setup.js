jest.mock("firebase-admin"); // ✅ Mock Firebase Admin SDK
const admin = require("firebase-admin");

const mockUsers = [
    { id: "user1", name: "Test User 1", email: "test1@example.com" },
    { id: "user2", name: "Test User 2", email: "test2@example.com" }
];

const mockFirestore = {
    collection: jest.fn((collectionName) => ({
        doc: jest.fn((docId) => {
            if (collectionName === "users") {
                return {
                    get: jest.fn(async () => ({
                        exists: true,
                        data: () => mockUsers.find(user => user.id === docId) || {},
                    })),
                    set: jest.fn(() => Promise.resolve()),
                };
            }
            return {
                get: jest.fn(async () => ({
                    exists: true,
                    data: () => ({
                        childId: docId,
                        scores: {},
                    }),
                })),
                set: jest.fn(() => Promise.resolve()),
                collection: jest.fn(() => ({
                    doc: jest.fn(() => ({
                        set: jest.fn(() => Promise.resolve()),
                    })),
                })),
            };
        }),
        get: jest.fn(async () => ({
            docs: collectionName === "users"
                ? mockUsers.map(user => ({
                    data: () => user,
                }))
                : [],
        })),
    })),
};

admin.firestore = jest.fn(() => mockFirestore);

admin.firestore.FieldValue = {
    serverTimestamp: jest.fn(() => new Date()), // Mock timestamp function
};

const app = require("../index");
global.app = app;
