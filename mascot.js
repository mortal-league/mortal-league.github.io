(() => {
  const menuLinks = document.querySelectorAll('.site-header nav a');
  const heroActions = document.querySelectorAll('.hero-actions a');
  const bigTroll = document.querySelector('.mascot-frame');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if ((!menuLinks.length && !heroActions.length) || reduceMotion.matches) return;

  const finisher = document.createElement('span');
  finisher.className = 'troll-finisher';
  finisher.setAttribute('aria-hidden', 'true');
  document.body.append(finisher);

  let isRunning = false;

  const clearAnimation = () => {
    isRunning = false;
    document.body.classList.remove('troll-finisher-running');
    finisher.classList.remove('is-running');
    bigTroll?.classList.remove('is-tool-smash');
  };

  window.addEventListener('pageshow', clearAnimation);

  const bindAnimation = (link, animation) => {
    link.addEventListener('click', (event) => {
      const plainLeftClick = event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      const url = new URL(link.href, window.location.href);
      const allowExternal = animation === 'large';

      if (
        event.defaultPrevented ||
        !plainLeftClick ||
        isRunning ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        (url.origin !== window.location.origin && !allowExternal)
      ) return;

      event.preventDefault();
      isRunning = true;
      if (animation === 'header') {
        document.body.classList.add('troll-finisher-running');
        finisher.classList.add('is-running');
      }
      if (bigTroll && animation === 'large') {
        bigTroll.classList.add('is-tool-smash');
      }

      window.setTimeout(() => {
        window.location.assign(url.href);
      }, 1500);
    });
  };

  menuLinks.forEach((link) => bindAnimation(link, 'header'));
  if (bigTroll) {
    heroActions.forEach((link) => bindAnimation(link, 'large'));
  }
})();
