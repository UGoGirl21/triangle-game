import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { createGame, gameReducer } from "../game/gameLogic.js";
import { mulberry32, randomSeed } from "../game/rng.js";
import { LOGICAL_H, MOBILE_LOGICAL_H } from "../game/constants.js";

const JOIN_TIMEOUT_MS = 6000;

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

  const [clientId] = useState(() => crypto.randomUUID());
  const channelRef = useRef(null);
  const pairedRef = useRef(false);

  function cleanup() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  useEffect(() => cleanup, []);

  function dispatchLocal(action) {
    setGameState((prev) => (prev ? gameReducer(prev, action) : prev));
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
          const guestInfo = { name: entry.name, symbol: entry.symbol };
          const hostInfoLocal = { name, symbol };
          const nextPlayers = { 1: hostInfoLocal, 2: guestInfo };
          setPlayers(nextPlayers);
          setGameState(createGame(dotCount, { rng: mulberry32(seed), boardHeight }));
          setPhase("playing");
          channel.track({ clientId, role: 1, name, symbol, status: "started" });
          channel.send({
            type: "broadcast",
            event: "init",
            payload: { seed, dotCount, boardHeight, players: nextPlayers },
          });
          break;
        }
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      if (key !== clientId && pairedRef.current) setPhase("disconnected");
    });

    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      dispatchLocal({ type: "MOVE", a: payload.a, b: payload.b });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ clientId, role: 1, name, symbol, status: "waiting" });
      }
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
          cleanup();
          setPhase("room-taken");
          return;
        }
        setHostInfo({ name: entry.name, symbol: entry.symbol });
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      if (key !== clientId && pairedRef.current) setPhase("disconnected");
    });

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
      if (status === "SUBSCRIBED") {
        await channel.track({
          clientId, role: 2, name: "", symbol: "", status: "previewing",
        });
      }
    });
  }

  function finalizeJoin({ name, symbol }) {
    channelRef.current?.track({
      clientId, role: 2, name, symbol, status: "ready",
    });
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
    phase, code, role, players, hostInfo, gameState,
    startAsHost, peekRoom, finalizeJoin, makeMove, select, cancel, showNotice, clearNotice, leave,
  };
}
