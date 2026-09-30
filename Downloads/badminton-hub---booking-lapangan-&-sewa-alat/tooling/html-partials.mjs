import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

// Resolve HTML fragments on the server/build, before Vite processes index.html.
// The protected server/admin-panel.html must never be included here.
export function htmlPartialsPlugin() {
  let templateRoot;
  return {
    name: 'html-partials',
    configResolved(config) { templateRoot = resolve(config.root, 'src/templates'); },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!-- include:([a-z0-9/-]+) -->/g, (_, name) => {
          const file = resolve(templateRoot, `${name}.html`);
          if (!file.startsWith(templateRoot + sep)) throw new Error('Invalid template path');
          return readFileSync(file, 'utf8');
        });
      }
    },
    configureServer(server) {
      server.watcher.add(templateRoot);
      server.watcher.on('change', file => {
        if (resolve(file).startsWith(templateRoot + sep)) server.ws.send({ type: 'full-reload', path: '*' });
      });
    }
  };
}
