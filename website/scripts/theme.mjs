export const themePicker = '<label class="theme-picker">Theme <select><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>';

const inkNames = {
  g: 'dark green', li: 'lime green', pu: 'purple', br: 'brown', or: 'orange',
  p: 'light pink', lb: 'light blue', hp: 'hot pink', pen: 'pencil',
  r: 'red', db: 'dark blue', mb: 'medium blue',
};

export function inkLegend(inks, label = 'Token color legend') {
  return `<div class="legend" role="group" aria-label="${label}">${Object.keys(inks).map(ink => `<span><i class="swatch ${ink}" aria-hidden="true"></i>${ink} ${ink === 'y' ? ('mb' in inks ? 'yellow' : 'medium blue') : inkNames[ink]}</span>`).join('')}</div>`;
}
