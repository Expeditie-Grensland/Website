/* eslint-disable no-var */
import { getFullExpeditie } from "./db/expeditie.js";
import { getPerson, authenticatePerson } from "./db/person.js";

declare module "fastify" {
  export interface FastifyReply {
    sendHtml: (html: string) => void;

    locals: {
      user?: Awaited<ReturnType<typeof authenticatePerson>>;
      person?: Awaited<ReturnType<typeof getPerson>>;
      expeditie?: Awaited<ReturnType<typeof getFullExpeditie>>;
      parsedPrefix?: unknown;
    };
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    userId: string;
    returnTo: string;
  }
}

// Fix to allow textual event handlers for SSR
declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      onLoad?: string;
      onLoadCapture?: string;
      onError?: string;
      onErrorCapture?: string;

      // Clipboard Events
      onCopy?: string;
      onCopyCapture?: string;
      onCut?: string;
      onCutCapture?: string;
      onPaste?: string;
      onPasteCapture?: string;

      // Composition Events
      onCompositionEnd?: string;
      onCompositionEndCapture?: string;
      onCompositionStart?: string;
      onCompositionStartCapture?: string;
      onCompositionUpdate?: string;
      onCompositionUpdateCapture?: string;

      // Details Events
      onToggle?: string;

      // Dialog Events
      onClose?: string;
      onCancel?: string;

      // Focus Events
      onFocus?: string;
      onFocusCapture?: string;
      onFocusIn?: string;
      onFocusInCapture?: string;
      onFocusOut?: string;
      onFocusOutCapture?: string;
      onBlur?: string;
      onBlurCapture?: string;

      // Form Events
      onChange?: string;
      onChangeCapture?: string;
      onInput?: string;
      onInputCapture?: string;
      onBeforeInput?: string;
      onBeforeInputCapture?: string;
      onSearch?: string;
      onSearchCapture?: string;
      onSubmit?: string;
      onSubmitCapture?: string;
      onInvalid?: string;
      onInvalidCapture?: string;
      onReset?: string;
      onResetCapture?: string;
      onFormData?: string;
      onFormDataCapture?: string;

      // Keyboard Events
      onKeyDown?: string;
      onKeyDownCapture?: string;
      onKeyPress?: string;
      onKeyPressCapture?: string;
      onKeyUp?: string;
      onKeyUpCapture?: string;

      // Media Events
      onAbort?: string;
      onAbortCapture?: string;
      onCanPlay?: string;
      onCanPlayCapture?: string;
      onCanPlayThrough?: string;
      onCanPlayThroughCapture?: string;
      onDurationChange?: string;
      onDurationChangeCapture?: string;
      onEmptied?: string;
      onEmptiedCapture?: string;
      onEncrypted?: string;
      onEncryptedCapture?: string;
      onEnded?: string;
      onEndedCapture?: string;
      onLoadedData?: string;
      onLoadedDataCapture?: string;
      onLoadedMetadata?: string;
      onLoadedMetadataCapture?: string;
      onLoadStart?: string;
      onLoadStartCapture?: string;
      onPause?: string;
      onPauseCapture?: string;
      onPlay?: string;
      onPlayCapture?: string;
      onPlaying?: string;
      onPlayingCapture?: string;
      onProgress?: string;
      onProgressCapture?: string;
      onRateChange?: string;
      onRateChangeCapture?: string;
      onSeeked?: string;
      onSeekedCapture?: string;
      onSeeking?: string;
      onSeekingCapture?: string;
      onStalled?: string;
      onStalledCapture?: string;
      onSuspend?: string;
      onSuspendCapture?: string;
      onTimeUpdate?: string;
      onTimeUpdateCapture?: string;
      onVolumeChange?: string;
      onVolumeChangeCapture?: string;
      onWaiting?: string;
      onWaitingCapture?: string;

      // MouseEvents
      onClick?: string;
      onClickCapture?: string;
      onContextMenu?: string;
      onContextMenuCapture?: string;
      onDblClick?: string;
      onDblClickCapture?: string;
      onDrag?: string;
      onDragCapture?: string;
      onDragEnd?: string;
      onDragEndCapture?: string;
      onDragEnter?: string;
      onDragEnterCapture?: string;
      onDragExit?: string;
      onDragExitCapture?: string;
      onDragLeave?: string;
      onDragLeaveCapture?: string;
      onDragOver?: string;
      onDragOverCapture?: string;
      onDragStart?: string;
      onDragStartCapture?: string;
      onDrop?: string;
      onDropCapture?: string;
      onMouseDown?: string;
      onMouseDownCapture?: string;
      onMouseEnter?: string;
      onMouseEnterCapture?: string;
      onMouseLeave?: string;
      onMouseLeaveCapture?: string;
      onMouseMove?: string;
      onMouseMoveCapture?: string;
      onMouseOut?: string;
      onMouseOutCapture?: string;
      onMouseOver?: string;
      onMouseOverCapture?: string;
      onMouseUp?: string;
      onMouseUpCapture?: string;

      // Selection Events
      onSelect?: string;
      onSelectCapture?: string;

      // Touch Events
      onTouchCancel?: string;
      onTouchCancelCapture?: string;
      onTouchEnd?: string;
      onTouchEndCapture?: string;
      onTouchMove?: string;
      onTouchMoveCapture?: string;
      onTouchStart?: string;
      onTouchStartCapture?: string;

      // Pointer Events
      onPointerOver?: string;
      onPointerOverCapture?: string;
      onPointerEnter?: string;
      onPointerEnterCapture?: string;
      onPointerDown?: string;
      onPointerDownCapture?: string;
      onPointerMove?: string;
      onPointerMoveCapture?: string;
      onPointerUp?: string;
      onPointerUpCapture?: string;
      onPointerCancel?: string;
      onPointerCancelCapture?: string;
      onPointerOut?: string;
      onPointerOutCapture?: string;
      onPointerLeave?: string;
      onPointerLeaveCapture?: string;
      onGotPointerCapture?: string;
      onGotPointerCaptureCapture?: string;
      onLostPointerCapture?: string;
      onLostPointerCaptureCapture?: string;

      // UI Events
      onScroll?: string;
      onScrollEnd?: string;
      onScrollCapture?: string;

      // Wheel Events
      onWheel?: string;
      onWheelCapture?: string;

      // Animation Events
      onAnimationStart?: string;
      onAnimationStartCapture?: string;
      onAnimationEnd?: string;
      onAnimationEndCapture?: string;
      onAnimationIteration?: string;
      onAnimationIterationCapture?: string;

      // Transition Events
      onTransitionCancel?: string;
      onTransitionCancelCapture?: string;
      onTransitionEnd?: string;
      onTransitionEndCapture?: string;
      onTransitionRun?: string;
      onTransitionRunCapture?: string;
      onTransitionStart?: string;
      onTransitionStartCapture?: string;

      // PictureInPicture Events
      onEnterPictureInPicture?: string;
      onEnterPictureInPictureCapture?: string;
      onLeavePictureInPicture?: string;
      onLeavePictureInPictureCapture?: string;
      onResize?: string;
      onResizeCapture?: string;
    }
  }
}

declare global {
  var rootDir: string;
  var cliMode: boolean;
}
