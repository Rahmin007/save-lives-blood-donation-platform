import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Send, Search } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../stores/useAuthStore";
import { api, errorMessage } from "../lib/api";
import { getSocket } from "../lib/socket";
import { formatTime, timeAgo } from "../lib/format";

const Messages = () => {
  const me = useAuthStore((s) => s.user?.user);
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser ?? null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(location.state?.draft ?? "");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState({}); // userId -> count
  const bottomRef = useRef(null);
  const selectedRef = useRef(selectedUser);
  selectedRef.current = selectedUser;

  // Clear the router state so a refresh doesn't re-insert the draft.
  useEffect(() => {
    if (location.state) window.history.replaceState({}, document.title);
  }, [location.state]);

  useEffect(() => {
    api.get("/messages/users")
      .then((res) => setUsers(res.data))
      .catch((err) => toast.error(errorMessage(err, "Could not load conversations.")));
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setUnread((u) => ({ ...u, [selectedUser._id]: 0 }));
    api.get(`/messages/${selectedUser._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => toast.error(errorMessage(err, "Could not load messages.")));
  }, [selectedUser]);

  // One subscription for the whole page (the old code reconnected on every click).
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onMessage = (msg) => {
      const other = String(msg.sender) === String(me._id) ? String(msg.receiver) : String(msg.sender);
      if (selectedRef.current && other === String(selectedRef.current._id)) {
        setMessages((list) => (list.some((m) => m._id === msg._id) ? list : [...list, msg]));
      } else if (String(msg.sender) !== String(me._id)) {
        setUnread((u) => ({ ...u, [other]: (u[other] ?? 0) + 1 }));
        toast(`New message from ${msg.senderName ?? "someone"}`, { icon: "💬" });
      }
      // Move this conversation to the top of the list.
      setUsers((list) => {
        const idx = list.findIndex((u) => String(u._id) === other);
        if (idx === -1) return list;
        const updated = { ...list[idx], lastMessage: { text: msg.text, createdAt: msg.createdAt } };
        return [updated, ...list.slice(0, idx), ...list.slice(idx + 1)];
      });
    };
    socket.on("message:new", onMessage);
    return () => socket.off("message:new", onMessage);
  }, [me._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !selectedUser || sending) return;
    setSending(true);
    try {
      const res = await api.post("/messages", { receiverId: selectedUser._id, text: body });
      setMessages((list) => (list.some((m) => m._id === res.data._id) ? list : [...list, res.data]));
      setText("");
    } catch (err) {
      toast.error(errorMessage(err, "Message not sent."));
    } finally {
      setSending(false);
    }
  };

  const visibleUsers = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(query.trim().toLowerCase())),
    [users, query],
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-base-200">
      <Navbar />
      <div className="flex flex-1 min-h-0 max-w-6xl w-full mx-auto md:p-4 gap-4">
        {/* Conversation list (hidden on phones while a chat is open) */}
        <aside className={`${selectedUser ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 bg-base-100 md:rounded-box md:border border-base-300 min-h-0`}>
          <div className="p-3 border-b border-base-300">
            <label className="input input-bordered input-sm flex items-center gap-2">
              <Search size={14} aria-hidden="true" />
              <input type="search" placeholder="Search people" value={query} onChange={(e) => setQuery(e.target.value)} className="grow" aria-label="Search people" />
            </label>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {visibleUsers.map((u) => (
              <li key={u._id}>
                <button
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-base-200 ${selectedUser?._id === u._id ? "bg-base-200" : ""}`}
                >
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    {u.name[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2">
                      <span className="font-medium truncate">{u.name}</span>
                      {u.lastMessage && <span className="text-xs text-base-content/50 shrink-0">{timeAgo(u.lastMessage.createdAt)}</span>}
                    </span>
                    <span className="text-sm text-base-content/60 truncate block">{u.lastMessage?.text ?? u.bloodGroup ?? ""}</span>
                  </span>
                  {unread[u._id] > 0 && <span className="badge badge-primary badge-sm">{unread[u._id]}</span>}
                </button>
              </li>
            ))}
            {!visibleUsers.length && <li className="p-6 text-center text-sm text-base-content/60">No people found.</li>}
          </ul>
        </aside>

        {/* Chat panel */}
        <section className={`${selectedUser ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0 bg-base-100 md:rounded-box md:border border-base-300 min-h-0`}>
          {selectedUser ? (
            <>
              <header className="flex items-center gap-3 p-3 border-b border-base-300">
                <button className="btn btn-ghost btn-sm btn-square md:hidden" onClick={() => setSelectedUser(null)} aria-label="Back to conversations">
                  <ArrowLeft size={18} />
                </button>
                <span className="grid place-items-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold">{selectedUser.name[0]?.toUpperCase()}</span>
                <p className="font-semibold">{selectedUser.name}</p>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-1" aria-live="polite">
                {messages.length === 0 && <p className="text-center text-sm text-base-content/60 mt-10">No messages yet. Say hello!</p>}
                {messages.map((msg) => {
                  const mine = String(msg.sender?._id ?? msg.sender) === String(me._id);
                  return (
                    <div key={msg._id} className={`chat ${mine ? "chat-end" : "chat-start"}`}>
                      <div className={`chat-bubble whitespace-pre-line break-words ${mine ? "chat-bubble-primary" : ""}`}>{msg.text}</div>
                      <div className="chat-footer text-xs opacity-60 mt-0.5">{formatTime(msg.createdAt)}</div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-base-300 flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message"
                  maxLength={1000}
                  className="input input-bordered flex-1"
                  aria-label="Message"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending} aria-label="Send">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-base-content/60 p-6 text-center">
              Choose someone on the left to start chatting.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
