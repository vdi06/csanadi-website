/** A látható modálon kívüli tartalom ideiglenes kizárása.
 * Az ősök testvéreit is kezeli, így a fejlécbe ágyazott mobilablakoknál is működik.
 * A korábbi inert-állapotot pontosan visszaállítja. */
export function isolateModal(overlay) {
  const changed = [];
  let branch = overlay;
  while (branch && branch !== document.body) {
    const parent = branch.parentElement || branch.parentNode;
    if (!parent) break;
    for (const sibling of parent.children || []) {
      if (sibling === branch || !sibling || typeof sibling !== "object") continue;
      changed.push([sibling, Boolean(sibling.inert)]);
      sibling.inert = true;
    }
    branch = parent;
  }
  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    for (const [sibling, wasInert] of changed) sibling.inert = wasInert;
  };
}
