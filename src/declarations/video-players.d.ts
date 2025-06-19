// Declaraciones para la API de YouTube
interface YT {
  Player: {
    new (element: HTMLElement | string, options: {
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }): {
      getDuration: () => number;
      seekTo: (seconds: number, allowSeekAhead: boolean) => void;
      getCurrentTime: () => number;
      destroy: () => void;
    };
  };
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
  };
}

// Declaraciones para la API de Vimeo
interface VimeoPlayer {
  new (element: HTMLElement | string, options?: object): {
    on: (event: string, callback: (data?: any) => void) => void;
    getDuration: () => Promise<number>;
    setCurrentTime: (seconds: number) => Promise<void>;
    destroy: () => void;
  };
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: () => void;
  Vimeo: {
    Player: VimeoPlayer;
  };
} 