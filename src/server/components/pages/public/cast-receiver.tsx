import type { FunctionComponent } from "preact";
import { Page } from "../../page-structure/page.js";

export const CastReceiverPage: FunctionComponent = () => (
  <Page
    title="Expeditie Grensland cast-ontvanger"
    head={
      <>
        <link rel="stylesheet" href="/static/styles/cast-receiver.css" />
        <script src="https://www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js" />
      </>
    }
    afterBody={<script src="/static/scripts/cast-receiver.js" />}
  >
    <div id="container">
      <video autoplay id="video"></video>
    </div>

    <div id="logo"></div>
  </Page>
);
