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

    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => {
                return {
                    id: "mocked_child_id", // 🔥 Ensure doc().id is set correctly
                    set: jest.fn(async () => Promise.resolve()), // Ensure this resolves properly
                    get: jest.fn(async () => ({
                        exists: true,
                        data: () => ({ id: "mocked_doc", email: "mockuser@example.com" }),
                    })),
                };
            }),
            get: jest.fn(async () => ({
                docs: [
                    {
                        data: () => ({ id: "mocked_user", email: "mockuser@example.com" }),
                    },
                ],
            })),
        })),
    })),

    FieldValue: {
        serverTimestamp: jest.fn(() => new Date()),
    },
};

admin.firestore.FieldValue = admin.FieldValue;

module.exports = admin;
