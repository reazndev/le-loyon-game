/** Creates an element with a class and appends it to a parent. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  parent: HTMLElement,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  parent.appendChild(element);
  return element;
}

export function setVisible(element: HTMLElement, visible: boolean): void {
  element.classList.toggle('ui-hidden', !visible);
}

/** Fades an element's opacity and resolves when done. */
export function fadeOpacity(element: HTMLElement, to: number, seconds: number): Promise<void> {
  const from = Number(getComputedStyle(element).opacity);
  if (seconds <= 0 || from === to) {
    element.style.opacity = String(to);
    return Promise.resolve();
  }
  const animation = element.animate([{ opacity: from }, { opacity: to }], { duration: seconds * 1000, fill: 'forwards' });
  return animation.finished.then(() => {
    element.style.opacity = String(to);
    animation.cancel();
  });
}
