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
            return { uid: `mocked_uid_${Math.floor(Math.random() * 1000)}`, email };
        }),

        verifyIdToken: jest.fn(async (idToken) => {
            if (idToken === "invalid_token") {
                throw new Error("Invalid token");
            }
            return { uid: "mocked_uid", email: "mockuser@example.com" };
        }),
    })),

    firestore: jest.fn(() => {
        const mockUsers = [];
        const mockChildren = [];
        const mockChildScores = {
            mocked_child_id: {
                childId: "mocked_child_id",
                alphabetScores: { level1: 0, level2: 0, level3: 0 },
                numbersScores: { level1: 0, level2: 0 },
            },
        };

        return {
            collection: jest.fn((name) => ({
                doc: jest.fn((id) => {
                    if (!id) id = `mocked_${name}_id_${Math.floor(Math.random() * 1000)}`;

                    return {
                        id,
                        get: jest.fn(async () => {
                            if (name === "users") {
                                const user = mockUsers.find((u) => u.id === id);
                                return { exists: !!user, data: () => user };
                            }

                            if (name === "children") {
                                const child = mockChildren.find((c) => c.id === id);
                                return { exists: !!child, data: () => child };
                            }

                            if (name === "childScores") {
                                return {
                                    exists: !!mockChildScores[id],
                                    data: () => mockChildScores[id] || {
                                        alphabetScores: { level1: 0, level2: 0, level3: 0 },
                                        numbersScores: { level1: 0, level2: 0 },
                                    },
                                };
                            }

                            return { exists: false };
                        }),
                        set: jest.fn(async (data, options) => {
                            if (name === "users") {
                                const existingUser = mockUsers.find((u) => u.id === id);
                                if (existingUser) Object.assign(existingUser, data);
                                else mockUsers.push({ id, ...data });
                            } else if (name === "children") {
                                const existingChild = mockChildren.find((c) => c.id === id);
                                if (existingChild) Object.assign(existingChild, data);
                                else mockChildren.push({ id, ...data });
                            } else if (name === "childScores") {
                                mockChildScores[id] = options?.merge
                                    ? { ...(mockChildScores[id] || {}), ...data }
                                    : data;
                            }
                            return Promise.resolve();
                        }),
                    };
                }),
                get: jest.fn(async () => ({
                    docs: name === "users"
                        ? mockUsers.map((user) => ({ data: () => user }))
                        : mockChildren.map((child) => ({ data: () => child })),
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
