const server = jest.requireActual('next/server');

module.exports = {
    ...server,
    NextResponse: {
        ...server.NextResponse,
        json: (data, options) => {
            return {
                json: () => Promise.resolve(data),
                status: options?.status || 200,
            };
        },
    },
};