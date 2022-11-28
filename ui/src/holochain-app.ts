import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AdminWebsocket,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';

import { appWebsocketContext, appInfoContext } from './contexts';

@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @state() loading = true;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );

    const adminWebsocket = await AdminWebsocket.connect(
      `ws://localhost:${process.env.ADMIN_PORT}`
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'clone-test',
    });

    // creating cloned cell
    console.log("Creating cloned cell.")
    await this.appWebsocket.createCloneCell({
      app_id: 'clone-test',
      role_id: 'clones',
      modifiers: {
        network_seed: 'some_seed',
      },
    });
    console.log("AppInfo: ", this.appWebsocket.appInfo({installed_app_id: 'clone-test'}));

    // archiving cloned cell
    console.log("Archiving cloned cell.")
    await this.appWebsocket.archiveCloneCell({
      app_id: 'clone-test',
      clone_cell_id: 'clones.0',
    });
    console.log("AppInfo: ", this.appWebsocket.appInfo({installed_app_id: 'clone-test'}));

    // delete archived clone cell
    console.log("Deleting archived clone cell.")
    await adminWebsocket.deleteArchivedCloneCells({
      app_id: 'clone-test',
      role_id: 'clones.0',
    });

    console.log("Deleted cell.")

    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <main>
        <h1>my-app</h1>

        <div id="content"></div>
      </main>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}
