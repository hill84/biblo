import './css/snackbar.css';

export const PUBLIC_URL = 'https://biblo.space';

export function displayUpdateNotification() {
  const link = document.createElement('a');
  
  link.classList.add('snackbar', 'update-notification');
  link.setAttribute('href', '#');
  link.innerHTML = '<span class="snackbar-message">🚀 Nuova versione disponibile</span><span class="snackbar-action"><button type="button" class="btn flat sm">Installa</button></span>';
  link.addEventListener('click', e => {
    e.preventDefault();
    window.location.reload();
  });
  document.querySelector('body')?.appendChild(link);
}