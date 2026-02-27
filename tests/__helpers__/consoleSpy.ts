export type ConsoleSpy = ReturnType<typeof spyOnConsole>;

export function spyOnConsole() {
  const consoleLogSpy = jest.spyOn(console, 'log');

  return {
    consoleLogSpy,
    expectConsoleLogToContain(...expected: any[]) {
      for (const part of expected) {
        const expectedCondition = typeof part === 'string' ? expect.stringContaining(part) : part;

        expect(consoleLogSpy.mock.calls).toContainEqual(
          expect.arrayContaining([expectedCondition])
        );
      }
    },
  };
}
