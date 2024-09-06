export function spyOnConsole() {
  const consoleLogSpy = jest.spyOn(console, 'log');

  return {
    consoleLogSpy,
    expectConsoleLogToContain(expected: string) {
      expect(consoleLogSpy.mock.calls).toContainEqual(
        expect.arrayContaining([expect.stringContaining(expected)])
      );
    },
  };
}
