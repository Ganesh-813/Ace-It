import React, { useState } from 'react';
import { Search, UserPlus, Users, Flame, Sparkles, Check, Clock, ChevronRight, UserCheck, Shield } from 'lucide-react';
import { User, FriendRequest } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';

interface FriendsViewProps {
  currentUser: User;
  onOpenFriendProfile: (friend: User) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  onOpenFriendProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const friends = storage.getFriendsForUser();
  const requests = storage.getFriendRequests();
  const incomingRequests = requests.filter(
    (r) => r.toUserId === currentUser.id && r.status === 'pending'
  );

  // Search through all app users
  const allUsers = storage.getAllUsers();
  const searchResults = searchQuery.trim()
    ? allUsers.filter(
        (u) =>
          u.id !== currentUser.id &&
          (u.username.toLowerCase().includes(searchQuery.toLowerCase().replace(/^@/, '')) ||
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSendRequest = (targetUserId: string) => {
    sound.tap();
    try {
      storage.sendFriendRequest(targetUserId);
      sound.pearlChime(1.1);
      setActiveNotification('Friend request sent!');
      setTimeout(() => setActiveNotification(null), 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActiveNotification(err.message);
      }
    }
  };

  const handleAcceptRequest = (reqId: string) => {
    sound.tap();
    storage.respondToFriendRequest(reqId, 'accepted');
    sound.pearlChime(1.3);
  };

  const handleDeclineRequest = (reqId: string) => {
    sound.tap();
    storage.respondToFriendRequest(reqId, 'declined');
  };

  return (
    <div className="pb-24 px-4 pt-2 space-y-4 select-none max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Accountability Network
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Friends
          </h1>
        </div>

        {/* Tab pill for requests if any */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setTab('friends');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              tab === 'friends' ? 'bg-white text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setTab('requests');
            }}
            className={`px-3 py-1 rounded-lg relative transition-all ${
              tab === 'requests' ? 'bg-white text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <span>Requests</span>
            {incomingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friends by username: @..."
          className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 transition-colors"
        />
      </div>

      {activeNotification && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
          {activeNotification}
        </div>
      )}

      {/* SEARCH RESULTS DROPDOWN / LIST */}
      {searchQuery.trim() !== '' && (
        <div className="p-3 rounded-2xl bg-slate-900/95 border border-white/15 space-y-2 shadow-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
            Search Results ({searchResults.length})
          </span>

          {searchResults.length === 0 ? (
            <div className="py-3 px-2 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No user registered with "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  try {
                    const cleanHandle = searchQuery.replace(/^@/, '').trim();
                    const res = storage.addFriendByHandle(cleanHandle);
                    sound.pearlChime(1.2);
                    if (res.user) {
                      setActiveNotification(`Added @${res.user.username} to your squad!`);
                    } else {
                      setActiveNotification(res.message);
                    }
                    setSearchQuery('');
                  } catch (e: unknown) {
                    if (e instanceof Error) setActiveNotification(e.message);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Connect with @{searchQuery.replace(/^@/, '')}</span>
              </button>
            </div>
          ) : (
            searchResults.map((usr) => {
              const isAlreadyFriend = friends.some((f) => f.id === usr.id);
              const hasSentReq = requests.some(
                (r) => r.fromUserId === currentUser.id && r.toUserId === usr.id && r.status === 'pending'
              );

              return (
                <div
                  key={usr.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                >
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => onOpenFriendProfile(usr)}
                  >
                    <img src={usr.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{usr.displayName}</p>
                      <p className="text-[10px] text-slate-400">@{usr.username} · 🔥 {usr.streak}d streak</p>
                    </div>
                  </div>

                  <div>
                    {isAlreadyFriend ? (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Friends</span>
                      </span>
                    ) : hasSentReq ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendRequest(usr.id)}
                        className="px-3 py-1 rounded-lg bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 flex items-center gap-1 shadow"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: INCOMING REQUESTS */}
      {tab === 'requests' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 px-1 block">
            Incoming Friend Requests ({incomingRequests.length})
          </span>

          {incomingRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 text-center text-slate-500 text-xs">
              No pending friend requests.
            </div>
          ) : (
            incomingRequests.map((req) => {
              const requester = storage.getUserById(req.fromUserId);
              if (!requester) return null;

              return (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onOpenFriendProfile(requester)}
                  >
                    <img
                      src={requester.avatarUrl}
                      alt={requester.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{requester.displayName}</p>
                      <p className="text-[10px] text-slate-400">
                        @{requester.username} · 🔥 {requester.streak}d streak
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow hover:bg-slate-100"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-700"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVE FRIENDS */}
      {tab === 'friends' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300">
              Your Accountability Squad ({friends.length})
            </span>
            <span className="text-[11px] text-slate-400">Tap to inspect</span>
          </div>

          {friends.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-dashed border-white/10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No friends connected yet</p>
              <p className="text-[11px] text-slate-400">
                Search for your friend's @username or email address above to form your accountability squad!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((fr) => {
                // calculate mutual goals count
                const mutualGoalsCount = storage
                  .getGoals()
                  .filter(
                    (g) =>
                      g.members.some((m) => m.userId === fr.id) &&
                      g.members.some((m) => m.userId === currentUser.id)
                  ).length;

                return (
                  <div
                    key={fr.id}
                    onClick={() => {
                      sound.tap();
                      onOpenFriendProfile(fr);
                    }}
                    className="p-3 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/15 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={fr.avatarUrl}
                          alt={fr.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                        />
                        {fr.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {fr.displayName}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          @{fr.username} · {mutualGoalsCount} shared goals
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-orange-400">
                          <Flame className="w-3.5 h-3.5 fill-orange-400" />
                          <span className="text-xs font-black tabular-nums">{fr.streak}d</span>
                        </div>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {fr.totalXp.toLocaleString()} XP
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
