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
                alphabetScores: { level1: 0, level2: 0, level3: 0 },
                numbersScores: { level1: 0, level2: 0 }
            },
        };

        return {
            collection: jest.fn(() => ({
                doc: jest.fn((id) => ({
                    id,
                    get: jest.fn(async () => ({
                        exists: !!mockChildScores[id],
                        data: () => mockChildScores[id] || {
                            childId: id,
                            alphabetScores: { level1: 0, level2: 0, level3: 0 },
                            numbersScores: { level1: 0, level2: 0 }
                        },
                    })),
                    set: jest.fn(async (data) => {
                        if (!mockChildScores[id]) {
                            mockChildScores[id] = { childId: id };
                        }
                        if (data.alphabetScores) {
                            mockChildScores[id].alphabetScores = {
                                ...mockChildScores[id].alphabetScores,
                                ...data.alphabetScores,
                            };
                        }
                        if (data.numbersScores) {
                            mockChildScores[id].numbersScores = {
                                ...mockChildScores[id].numbersScores,
                                ...data.numbersScores,
                            };
                        }
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
