import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Users,
  User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabaseClient';
import { User, Peer, Notification, Rating } from './types';

// Components
import { SplashScreen } from './components/SplashScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { LoginScreen } from './components/LoginScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { PeersScreen } from './components/PeersScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { SwapScreen } from './components/SwapScreen';
import { RatingModal } from './components/RatingModal';

// Utils
import { extractSwapMediaPath } from './utils/media';

type Screen = 'splash' | 'signup' | 'login' | 'explore' | 'peers' | 'profile' | 'edit-profile' | 'notifications' | 'swap';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Students');
  const [loading, setLoading] = useState(true);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [activeConnectionPeerUsername, setActiveConnectionPeerUsername] = useState<string>('');
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [ratingModalPeer, setRatingModalPeer] = useState<Peer | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
        setCurrentScreen('explore');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
        if (currentScreen === 'splash' || currentScreen === 'login' || currentScreen === 'signup') {
          setCurrentScreen('explore');
        }
      } else {
        setUser(null);
        setCurrentScreen('splash');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchPeers();
      fetchNotifications();
    }
  }, [user]);

  const fetchUserData = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, skills(*), achievements(*)')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    // Fetch ratings received by this user (for own profile display)
    const { data: receivedRatings } = await supabase
      .from('ratings')
      .select('*')
      .eq('ratee_id', userId);

    let averageRating: number | undefined;
    let ratingCount = receivedRatings?.length ?? 0;
    if (ratingCount > 0 && receivedRatings) {
      const sum = receivedRatings.reduce((acc: number, r: any) => {
        return acc + (r.teaching_quality + r.responsiveness + r.reliability) / 3;
      }, 0);
      averageRating = sum / ratingCount;
    }

    const formattedUser: User = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      contactNumber: profile.contact_number,
      bio: profile.bio || '',
      avatarUrl: profile.avatar_url || '',
      skillsToTeach: (profile.skills || []).filter((s: any) => s.type === 'teach').map((s: any) => s.skill_name),
      skillsToLearn: (profile.skills || []).filter((s: any) => s.type === 'learn').map((s: any) => s.skill_name),
      achievements: (profile.achievements || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        type: a.type
      })),
      averageRating,
      ratingCount,
    };

    setUser(formattedUser);
  };

  const fetchPeers = async () => {
    if (!user) return;

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, skills(*), achievements(*)')
      .neq('id', user.id);

    if (error) {
      console.error('Error fetching peers:', error);
      return;
    }

    const { data: connections, error: connError } = await supabase
      .from('connections')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (connError) {
      console.error('Error fetching connections:', connError);
    }

    // Fetch all ratings relevant to the current user (given or received)
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('*');

    const fetchedRatings: Rating[] = allRatings ?? [];
    setRatings(fetchedRatings);

    const formattedPeers: Peer[] = profiles.map((p: any) => {
      const conn = connections?.find(c =>
        (c.sender_id === user.id && c.receiver_id === p.id) ||
        (c.receiver_id === user.id && c.sender_id === p.id)
      );

      // Ratings this peer has received (from anyone)
      const peerReceivedRatings = fetchedRatings.filter(r => r.ratee_id === p.id);
      const ratingCount = peerReceivedRatings.length;
      let averageRating: number | undefined;
      if (ratingCount > 0) {
        const sum = peerReceivedRatings.reduce((acc, r) => {
          return acc + (r.teaching_quality + r.responsiveness + r.reliability) / 3;
        }, 0);
        averageRating = sum / ratingCount;
      }

      // Has current user already rated this peer?
      const hasRated = fetchedRatings.some(r => r.rater_id === user.id && r.ratee_id === p.id);

      return {
        id: p.id,
        username: p.username,
        email: p.email,
        contactNumber: p.contact_number,
        bio: p.bio || '',
        avatarUrl: p.avatar_url || '',
        skillsToTeach: (p.skills || []).filter((s: any) => s.type === 'teach').map((s: any) => s.skill_name),
        skillsToLearn: (p.skills || []).filter((s: any) => s.type === 'learn').map((s: any) => s.skill_name),
        achievements: (p.achievements || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          type: a.type
        })),
        connected: conn?.status === 'accepted',
        requestSent: conn?.status === 'pending' && conn.sender_id === user.id,
        swapOffering: conn?.status === 'accepted' ? {
          teach: conn.sender_id === p.id ? conn.swap_teach : conn.swap_learn,
          learn: conn.sender_id === p.id ? conn.swap_learn : conn.swap_teach
        } : undefined,
        averageRating,
        ratingCount,
        hasRated,
      };
    });

    setPeers(formattedPeers);
  };

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:profiles!sender_id(*, skills(*))')
      .eq('profile_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    const formattedNotifications: Notification[] = await Promise.all(data.map(async (n: any) => {
      let mediaUrl = n.media_url;
      if (mediaUrl) {
        const filePath = extractSwapMediaPath(mediaUrl);
        if (filePath) {
          const { data: signed } = await supabase.storage
            .from('swap-media')
            .createSignedUrl(filePath, 3600);
          mediaUrl = signed?.signedUrl ?? mediaUrl;
        }
      }
      return {
        id: n.id,
        profile_id: n.profile_id,
        sender_id: n.sender_id,
        title: n.title,
        content: n.content,
        is_read: n.is_read,
        created_at: n.created_at,
        media_url: mediaUrl,
        connection_id: n.connection_id,
        sender: {
          id: n.sender.id,
          username: n.sender.username,
          email: n.sender.email,
          contactNumber: n.sender.contact_number,
          bio: n.sender.bio || '',
          avatarUrl: n.sender.avatar_url || '',
          skillsToTeach: (n.sender.skills || []).filter((s: any) => s.type === 'teach').map((s: any) => s.skill_name),
          skillsToLearn: (n.sender.skills || []).filter((s: any) => s.type === 'learn').map((s: any) => s.skill_name),
          achievements: [],
          connected: false
        }
      };
    }));

    setNotifications(formattedNotifications);
  };

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0a0510] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Supabase Config Missing</h1>
        <p className="text-slate-400 mb-8">Please check your .env.local file.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0510] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categories = ['All Students', 'Design', 'Coding', 'Music', 'Business'];

  // Find an existing rating that current user gave to ratingModalPeer
  const existingRating = ratingModalPeer
    ? ratings.find(r => r.rater_id === user?.id && r.ratee_id === ratingModalPeer.id) ?? null
    : null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onSignUp={() => setCurrentScreen('signup')} onLogin={() => setCurrentScreen('login')} />;
      case 'signup':
        return (
          <SignUpScreen
            onBack={() => setCurrentScreen('splash')}
            onSignUpSuccess={() => {
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) fetchUserData(session.user.id);
              });
              setCurrentScreen('explore');
            }}
            onLogin={() => setCurrentScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('splash')}
            onLoginSuccess={() => setCurrentScreen('explore')}
            onSignUp={() => setCurrentScreen('signup')}
          />
        );
      case 'explore':
        return (
          <ExploreScreen
            peers={peers}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNotifications={() => setCurrentScreen('notifications')}
            unreadCount={notifications.length}
            onConnect={async (peerId: string) => {
              if (!user) return;
              setPeers(prev => prev.map(p => p.id === peerId ? { ...p, requestSent: true } : p));
              const peer = peers.find(p => p.id === peerId);
              await supabase.from('connections').insert({
                sender_id: user.id,
                receiver_id: peerId,
                status: 'pending',
                swap_teach: user.skillsToTeach[0] || 'Skill',
                swap_learn: peer?.skillsToTeach[0] || 'Skill'
              });
              await supabase.from('notifications').insert({
                profile_id: peerId,
                sender_id: user.id,
                title: 'Connect Request',
                content: `wants to swap ${user.skillsToTeach[0] || 'skills'} for ${peer?.skillsToTeach[0] || 'skills'}`,
                is_read: false
              });
            }}
          />
        );
      case 'peers':
        return (
          <PeersScreen
            peers={peers.filter(p => p.connected)}
            onSwap={async (peer: Peer) => {
              const { data } = await supabase
                .from('connections')
                .select('id')
                .eq('status', 'accepted')
                .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${peer.id}),and(sender_id.eq.${peer.id},receiver_id.eq.${user?.id})`)
                .single();

              if (data) {
                setActiveConnectionId(data.id);
                setActiveConnectionPeerUsername(peer.username);
                setActivePeerId(peer.id);
                setCurrentScreen('swap');
              }
            }}
            onRate={(peer: Peer) => setRatingModalPeer(peer)}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user!}
            onEdit={() => setCurrentScreen('edit-profile')}
            onLogout={async () => {
              await supabase.auth.signOut();
              setCurrentScreen('splash');
            }}
          />
        );
      case 'edit-profile':
        return (
          <EditProfileScreen
            user={user!}
            onBack={() => setCurrentScreen('profile')}
            onSave={() => {
              fetchUserData(user!.id);
              setCurrentScreen('profile');
            }}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onBack={() => setCurrentScreen('explore')}
            onAccept={async (notif) => {
              await supabase.from('connections').update({ status: 'accepted' }).eq('sender_id', notif.sender_id).eq('receiver_id', user!.id);
              await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
              fetchPeers();
              fetchNotifications();
            }}
            onDecline={async (notif) => {
              await supabase.from('connections').update({ status: 'declined' }).eq('sender_id', notif.sender_id).eq('receiver_id', user!.id);
              await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
              fetchNotifications();
            }}
            onViewSwap={async (notif) => {
              setActiveConnectionId(notif.connection_id!);
              setActiveConnectionPeerUsername(notif.sender.username);
              setActivePeerId(notif.sender_id);
              await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
              fetchNotifications();
              setCurrentScreen('swap');
            }}
          />
        );
      case 'swap':
        return (
          <SwapScreen
            onBack={() => setCurrentScreen('peers')}
            connectionId={activeConnectionId!}
            currentUserId={user!.id}
            peerUsername={activeConnectionPeerUsername}
            peerId={activePeerId!}
          />
        );
      default:
        return <SplashScreen onSignUp={() => setCurrentScreen('signup')} onLogin={() => setCurrentScreen('login')} />;
    }
  };

  const showNav = ['explore', 'peers', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#0a0510] text-slate-100 font-sans selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="pb-24"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <nav className="w-full max-w-md pointer-events-auto bg-[#120b1a]/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center pb-8 pt-4 px-6">
            <NavItem
              icon={<Compass className={cn("size-6", currentScreen === 'explore' ? "text-purple-500 fill-purple-500/20" : "text-slate-500")} />}
              label="Explore"
              active={currentScreen === 'explore'}
              onClick={() => setCurrentScreen('explore')}
            />
            <NavItem
              icon={<Users className={cn("size-6", currentScreen === 'peers' ? "text-purple-500 fill-purple-500/20" : "text-slate-500")} />}
              label="Peers"
              active={currentScreen === 'peers'}
              onClick={() => setCurrentScreen('peers')}
            />
            <NavItem
              icon={<UserIcon className={cn("size-6", currentScreen === 'profile' ? "text-purple-500 fill-purple-500/20" : "text-slate-500")} />}
              label="Profile"
              active={currentScreen === 'profile'}
              onClick={() => setCurrentScreen('profile')}
            />
          </nav>
        </div>
      )}

      {/* Rating Modal — rendered outside the screen router so it overlays everything */}
      <RatingModal
        peer={ratingModalPeer}
        currentUserId={user?.id ?? ''}
        existingRating={existingRating}
        onClose={() => setRatingModalPeer(null)}
        onRatingSubmitted={() => {
          fetchPeers();
          if (user) fetchUserData(user.id);
        }}
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      {icon}
      <span className={cn("text-[10px] font-bold uppercase tracking-tight transition-colors", active ? "text-purple-500" : "text-slate-500 group-hover:text-purple-400")}>
        {label}
      </span>
    </button>
  );
}
