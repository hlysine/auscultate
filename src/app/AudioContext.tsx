import React, { ReactNode, createContext, useContext, useState } from 'react';

interface AudioContext {
  nowPlaying: string | null;
  setNowPlaying: React.Dispatch<React.SetStateAction<string | null>>;
}

const audioContext = createContext<AudioContext>({
  nowPlaying: null,
  setNowPlaying: () => {},
});

export function useAudio() {
  return useContext(audioContext);
}

export function AudioContext({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  return (
    <audioContext.Provider value={{ nowPlaying, setNowPlaying }}>
      {children}
    </audioContext.Provider>
  );
}
