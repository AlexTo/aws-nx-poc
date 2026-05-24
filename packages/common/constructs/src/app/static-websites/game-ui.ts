import * as url from 'url';
import { Construct } from 'constructs';
import { StaticWebsite } from '../../core/index.js';

export class GameUI extends StaticWebsite {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      websiteName: 'GameUI',
      websiteFilePath: url.fileURLToPath(
        new URL(
          '../../../../../../dist/packages/game-ui/bundle',
          import.meta.url,
        ),
      ),
    });
  }
}
