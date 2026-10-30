/** True in the Electron app. Browsers ignore `window.close()` on tabs they didn't open, so only it offers Quit. */
export const isDesktopApp = (): boolean => navigator.userAgent.includes('Electron');
