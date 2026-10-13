(() => {
  const navigation = [
    { label: 'Home', href: '/', section: 'home' },
    { label: 'MO2', href: '/mortal-online-2/', section: 'mo2' },
    { label: 'MO1', href: '/mortal-online-1/', section: 'mo1' },
    { label: 'League', href: '/league/', section: 'league' },
    { label: 'Community', href: '/community/', section: 'community' },
    { label: 'Weekly', href: '/weekly/', section: 'weekly' },
    { label: 'Idea Lot', href: '/ideas/', section: 'ideas' },
    { label: 'Tools', href: '/tools/', section: 'tools' },
    { label: 'Rulebook', href: '/rules/', section: 'rules' },
  ];
  const communitySections = ['/community/', '/guilds/', '/reputation/', '/sherpa/', '/exploits/', '/wagers/', '/safety/'];
  const currentPath = window.location.pathname.replace(/index\.html$/, '');
  let currentSection = '';

  if (currentPath === '/') currentSection = 'home';
  else if (currentPath.startsWith('/mortal-online-2/')) currentSection = 'mo2';
  else if (currentPath.startsWith('/mortal-online-1/')) currentSection = 'mo1';
  else if (currentPath.startsWith('/league/')) currentSection = 'league';
  else if (communitySections.some((path) => currentPath.startsWith(path))) currentSection = 'community';
  else if (currentPath.startsWith('/weekly/')) currentSection = 'weekly';
  else if (currentPath.startsWith('/ideas/')) currentSection = 'ideas';
  else if (currentPath.startsWith('/tools/')) currentSection = 'tools';
  else if (currentPath.startsWith('/rules/')) currentSection = 'rules';
  else if (currentPath.startsWith('/about/')) currentSection = 'about';

  const siteNav = document.querySelector('.site-header nav');
  if (siteNav) {
    const fragment = document.createDocumentFragment();
    navigation.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      if (item.section === currentSection) link.setAttribute('aria-current', 'page');
      fragment.append(link);
    });
    siteNav.replaceChildren(fragment);
  }

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
