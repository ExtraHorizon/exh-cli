export function spyOnConsole() {
  const logSpy = jest.spyOn(console, 'log');

  return {
    logSpy,
    expectLogToContain(expected: string) {
      expect(logSpy.mock.calls).toContainEqual(
        expect.arrayContaining([expect.stringContaining(expected)])
      );
    },
  };
}
