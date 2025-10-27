module.exports = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  status: 200,
  ok: true,
}));
