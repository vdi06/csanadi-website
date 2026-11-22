/** Csak fókuszléptetés; a platformok saját modáljaikat és felületeiket építik. */
export function trapTab(event, controls) {
  if (event.key !== "Tab") return;
  const available = controls.filter((node) => node && !node.disabled && !node.hidden);
  if (!available.length) return;
  event.preventDefault();
  const current = available.indexOf(document.activeElement);
  const next = (current + (event.shiftKey ? available.length - 1 : 1) + available.length)
    % available.length;
  available[next].focus({ preventScroll: true });
}
