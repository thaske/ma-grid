export function Header() {
  const header = document.createElement("div");
  header.className = "ma-grid__header";
  header.innerHTML = `<h3 class="ma-grid__title">Activity</h3>`;
  return header;
}
