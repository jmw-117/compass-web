export function createPreviewUrl(report: HTMLElement) {
  const preview = document.implementation.createHTMLDocument('Assessment Report | Silverspark Compass');
  preview.documentElement.lang = 'en';
  const viewport = preview.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  preview.head.append(viewport);

  for (const source of document.querySelectorAll('link[rel="stylesheet"], style')) {
    const copy = preview.importNode(source, true);
    if (source instanceof HTMLLinkElement) copy.setAttribute('href', source.href);
    preview.head.append(copy);
  }

  const main = preview.createElement('main');
  main.className = 'standalone-report';
  main.append(preview.importNode(report, true));
  preview.body.append(main);
  return URL.createObjectURL(new Blob(['<!doctype html>', preview.documentElement.outerHTML], {type: 'text/html;charset=utf-8'}));
}
