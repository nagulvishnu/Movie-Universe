import { useEffect, useState } from "react";
import { TitleScreen } from "./ui/TitleScreen";
import { Player } from "./ui/Player";
import { loadPrefs, loadProgress, type Prefs } from "./ui/playback";

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [screen, setScreen] = useState<"title" | "play">("title");
  const [from, setFrom] = useState(0);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    document.title = "THE LAST CALL — a 3D animated psychological thriller";
  }, []);

  if (screen === "play")
    return (
      <Player
        key={from}
        startAt={from}
        prefs={prefs}
        setPrefs={setPrefs}
        onExit={() => {
          setProgress(loadProgress());
          setScreen("title");
        }}
      />
    );
  return (
    <TitleScreen
      prefs={prefs}
      setPrefs={setPrefs}
      progress={progress}
      onPlay={(t) => {
        setFrom(t);
        setScreen("play");
      }}
    />
  );
}
