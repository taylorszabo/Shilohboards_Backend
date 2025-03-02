const admin = {
    initializeApp: jest.fn(),

    credential: {
        cert: jest.fn(() => ({})),
    },

    auth: jest.fn(() => ({
        createUser: jest.fn(async ({ email, password }) => {
            if (!email || !password) {
                throw new Error("Invalid user data");
            }
            return { uid: "mocked_uid", email };
        }),

        verifyIdToken: jest.fn(async (idToken) => {
            if (idToken === "invalid_token") {
                throw new Error("Invalid token");
            }
            return { uid: "mocked_uid", email: "mockuser@example.com" };
        }),
    })),

    firestore: jest.fn(() => {
        const mockChildScores = {
            mocked_child_id: {
                childId: "mocked_child_id",
                scores: { level1: 0, level2: 0, level3: 0 }
            },
        };

        return {
            collection: jest.fn(() => ({
                doc: jest.fn((id) => ({
                    id,
                    get: jest.fn(async () => ({
                        exists: !!mockChildScores[id],
                        data: () => mockChildScores[id] || { scores: { level1: 0, level2: 0, level3: 0 } }, // Provide default if missing
                    })),
                    set: jest.fn(async (data) => {
                        mockChildScores[id] = data;
                        return Promise.resolve();
                    }),
                })),
            })),
        };
    }),

    FieldValue: {
        serverTimestamp: jest.fn(() => new Date()),
    },
};

admin.firestore.FieldValue = admin.FieldValue;

module.exports = admin;
