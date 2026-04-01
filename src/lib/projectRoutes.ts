/** True when pathname is `/projects/:id` (one segment after /projects/), not `/projects` alone. */
export function isProjectDetailPath(pathname: string): boolean {
  if (!pathname.startsWith("/projects/")) return false;
  const rest = pathname.slice("/projects/".length);
  return rest.length > 0 && !rest.includes("/");
}
