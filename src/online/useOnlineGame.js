import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { createGame, gameReducer } from "../game/gameLogic.js";
import { mulberry32, randomSeed } from "../game/rng.js";
import { LOGICAL_H, MOBILE_LOGICAL_H, randomColorPair } from "../game/constants.js";

const JOIN_TIMEOUT_MS = 6000;
const DISCONNECT_GRACE_MS = 3000;

const randomRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const resolveBoardHeight = () => typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches
  ? MOBILE_LOGICAL_H : LOGICAL_H;

export function useOnlineGame() {
  const [phase, setPhase] = useState("menu");
  const [code, setCode] = useState(null);
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState(null);
  const [hostInfo, setHostInfo] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const [clientId] = useState(() => crypto.randomUUID());
  const channelRef = useRef(null);
  const pairedRef = useRef(false);
  const announceRef = useRef(null);
  const disconnectTimerRef = useRef(null);

  function cleanup() {
    if (disconnectTimerRef.current) {
      window.clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  useEffect(() => cleanup, []);

  function dispatchLocal(action) {
    setGameState((prev) => (prev ? gameReducer(prev, action) : prev));
  }

  // Re-tracking presence (e.g. status "waiting" -> "started") makes the peer briefly
  // see a "leave" for the old ref immediately followed by a "join" for the new one —
  // that's normal Presence churn, not a real disconnect. Confirm absence after a grace
  // window (and let a same-role "join" within that window cancel the check) before
  // treating it as one.
  function watchPeerLeave(channel, peerRole, onConfirmedLeave) {
    const peerPresent = () => {
      const stateMap = channel.presenceState();
      return Object.keys(stateMap).some((key) => key !== clientId && stateMap[key][0].role === peerRole);
    };
    channel.on("presence", { event: "leave" }, ({ key }) => {
      if (key === clientId || !pairedRef.current) return;
      if (disconnectTimerRef.current) window.clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = window.setTimeout(() => {
        disconnectTimerRef.current = null;
        if (!peerPresent()) onConfirmedLeave();
      }, DISCONNECT_GRACE_MS);
    });
    channel.on("presence", { event: "join" }, ({ key }) => {
      if (key === clientId || !disconnectTimerRef.current) return;
      if (peerPresent()) {
        window.clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    });
  }

  function startAsHost({ name, symbol, dotCount }) {
    pairedRef.current = false;
    const newCode = randomRoomCode();
    setCode(newCode);
    setRole(1);
    setPlayers({ 1: { name, symbol }, 2: null });
    setPhase("hosting");

    const channel = supabase.channel(`game-${newCode}`, {
      config: { presence: { key: clientId } },
    });
    channelRef.current = channel;
    announceRef.current = { clientId, role: 1, name, symbol, status: "waiting" };

    channel.on("presence", { event: "sync" }, () => {
      if (pairedRef.current) return;
      const stateMap = channel.presenceState();
      for (const key of Object.keys(stateMap)) {
        if (key === clientId) continue;
        const entry = stateMap[key][0];
        if (entry.role === 2 && entry.status === "ready") {
          pairedRef.current = true;
          const seed = randomSeed();
          const boardHeight = resolveBoardHeight();
          const [hostColor, guestColor] = randomColorPair();
          const guestInfo = { name: entry.name, symbol: entry.symbol, color: guestColor.color, dark: guestColor.dark };
          const hostInfoLocal = { name, symbol, color: hostColor.color, dark: hostColor.dark };
          const nextPlayers = { 1: hostInfoLocal, 2: guestInfo };
          setPlayers(nextPlayers);
          setGameState(createGame(dotCount, { rng: mulberry32(seed), boardHeight }));
          setPhase("playing");
          announceRef.current = { clientId, role: 1, name, symbol, status: "started" };
          channel.track(announceRef.current);
          channel.send({
            type: "broadcast",
            event: "init",
            payload: { seed, dotCount, boardHeight, players: nextPlayers },
          });
          break;
        }
      }
    });

    watchPeerLeave(channel, 2, () => {
      pairedRef.current = false;
      announceRef.current = { clientId, role: 1, name, symbol, status: "waiting" };
      channel.track(announceRef.current);
      setPlayers({ 1: { name, symbol }, 2: null });
      setGameState(null);
      setPhase("hosting");
    });

    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      dispatchLocal({ type: "MOVE", a: payload.a, b: payload.b });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track(announceRef.current);
    });
  }

  function peekRoom(roomCode) {
    pairedRef.current = false;
    const normalized = roomCode.trim().toUpperCase();
    setCode(normalized);
    setRole(2);
    setHostInfo(null);
    setPhase("joining");

    const channel = supabase.channel(`game-${normalized}`, {
      config: { presence: { key: clientId } },
    });
    channelRef.current = channel;
    announceRef.current = { clientId, role: 2, name: "", symbol: "", status: "previewing" };

    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      setPhase("not-found");
    }, JOIN_TIMEOUT_MS);

    channel.on("presence", { event: "sync" }, () => {
      if (settled) return;
      const stateMap = channel.presenceState();
      for (const key of Object.keys(stateMap)) {
        if (key === clientId) continue;
        const entry = stateMap[key][0];
        if (entry.role !== 1) continue;
        if (entry.status === "started") {
          settled = true;
          window.clearTimeout(timer);
          setDebugInfo({ myClientId: clientId, stateMap, matchedKey: key, matchedEntry: entry });
          cleanup();
          setPhase("room-taken");
          return;
        }
        window.clearTimeout(timer);
        setHostInfo({ name: entry.name, symbol: entry.symbol });
      }
    });

    watchPeerLeave(channel, 1, () => setPhase("disconnected"));

    channel.on("broadcast", { event: "init" }, ({ payload }) => {
      settled = true;
      pairedRef.current = true;
      window.clearTimeout(timer);
      setPlayers(payload.players);
      setGameState(createGame(payload.dotCount, {
        rng: mulberry32(payload.seed), boardHeight: payload.boardHeight,
      }));
      setPhase("playing");
    });

    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      dispatchLocal({ type: "MOVE", a: payload.a, b: payload.b });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track(announceRef.current);
    });
  }

  function finalizeJoin({ name, symbol }) {
    announceRef.current = { clientId, role: 2, name, symbol, status: "ready" };
    channelRef.current?.track(announceRef.current);
  }

  function makeMove(a, b) {
    dispatchLocal({ type: "MOVE", a, b });
    channelRef.current?.send({ type: "broadcast", event: "move", payload: { a, b } });
  }

  function select(index) {
    dispatchLocal({ type: "SELECT", index });
  }

  function cancel() {
    dispatchLocal({ type: "CANCEL" });
  }

  function showNotice(message) {
    dispatchLocal({ type: "SHOW_NOTICE", id: Date.now(), message });
  }

  function clearNotice() {
    dispatchLocal({ type: "CLEAR_NOTICE" });
  }

  function leave() {
    cleanup();
    pairedRef.current = false;
    setPhase("menu");
    setCode(null);
    setRole(null);
    setPlayers(null);
    setHostInfo(null);
    setGameState(null);
  }

  return {
    phase, code, role, players, hostInfo, gameState, debugInfo,
    startAsHost, peekRoom, finalizeJoin, makeMove, select, cancel, showNotice, clearNotice, leave,
  };
}
