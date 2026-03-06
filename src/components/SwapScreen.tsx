import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, UploadCloud, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';
import { SwapMedia } from '../types';
import { PageWrapper } from './PageWrapper';
import { MediaContent } from './MediaContent';
import { extractSwapMediaPath } from '../utils/media';

export function SwapScreen({ onBack, connectionId, currentUserId, peerName, peerId }: { onBack: () => void, connectionId: string, currentUserId: string, peerName: string, peerId: string }) {
    const [media, setMedia] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [receivedMedia, setReceivedMedia] = useState<SwapMedia[]>([]);

    useEffect(() => {
        fetchMedia();
    }, [connectionId]);

    const fetchMedia = async () => {
        const { data, error } = await supabase
            .from('swap_media')
            .select('*')
            .eq('connection_id', connectionId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Generate signed URLs for each media item so they load regardless of bucket public settings
            const withSignedUrls = await Promise.all(
                data.map(async (item: any) => {
                    const filePath = extractSwapMediaPath(item.file_url);
                    if (filePath) {
                        const { data: signed } = await supabase.storage
                            .from('swap-media')
                            .createSignedUrl(filePath, 3600); // 1 hour expiry
                        return { ...item, file_url: signed?.signedUrl ?? item.file_url };
                    }
                    return item;
                })
            );
            setReceivedMedia(withSignedUrls);
        }
    };

    const handleFile = (selectedFile: File) => {
        if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/'))) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const handleSwap = async () => {
        if (!title || !file || !description) {
            alert("Please fill in all details and upload media.");
            return;
        }

        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${connectionId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('swap-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('swap-media')
                .getPublicUrl(filePath);

            // 3. Insert into swap_media table
            const { error: dbError } = await supabase.from('swap_media').insert({
                connection_id: connectionId,
                uploader_id: currentUserId,
                file_url: publicUrl,
                title,
                description
            });

            if (dbError) throw dbError;

            // 4. Send notification to the peer
            await supabase.from('notifications').insert({
                profile_id: peerId,
                sender_id: currentUserId,
                title: 'New Swap Media',
                content: `shared new media: ${title}`,
                media_url: publicUrl,
                connection_id: connectionId,
                is_read: false
            });

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onBack();
            }, 3000);
        } catch (err: any) {
            alert(err.message || 'Error sharing swap');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper noTopPadding className="relative overflow-hidden">
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-[100] bg-[#0a0510]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-600/40">
                            <Plus className="text-white size-12" strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Skill Shared!</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Your media has been shared with {peerName}.
                        </p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="h-1 bg-purple-600 rounded-full mt-12 max-w-[200px]"
                            transition={{ duration: 3 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-10 bg-[#0a0510]/80 backdrop-blur-md">
                <button onClick={onBack} className="text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeft className="size-6" />
                </button>
                <h1 className="text-white text-lg font-bold tracking-tight flex-1 text-center pr-10">Swap with {peerName}</h1>
            </header>


            <main className="flex flex-col p-6 gap-8 pb-32">
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-300 text-sm font-semibold px-1">Title</label>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center transition-all focus-within:border-purple-500">
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 p-4 text-base font-medium outline-none"
                                placeholder="What skill are you showing?"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={cn(
                            "flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 transition-all group cursor-pointer relative overflow-hidden",
                            isDragging ? "border-purple-500 bg-purple-500/20" : "border-white/20 bg-white/5 hover:border-purple-500/70 hover:bg-white/10",
                            media && "py-4"
                        )}
                    >
                        {media ? (
                            <div className="w-full aspect-video rounded-lg overflow-hidden relative group/media">
                                <MediaContent src={media} alt="Preview" className="w-full h-full" controls />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setMedia(null); setFile(null); }}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-purple-500/20 p-4 rounded-full text-purple-500 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="size-10" />
                                </div>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <p className="text-white text-lg font-bold">Upload Progress</p>
                                    <p className="text-slate-400 text-sm">Upload photos or videos of your skill</p>
                                </div>
                                <label className="mt-2 flex min-w-[120px] items-center justify-center rounded-full h-10 px-6 bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-transform cursor-pointer">
                                    Select File
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={(e) => {
                                            const selectedFile = e.target.files?.[0];
                                            if (selectedFile) handleFile(selectedFile);
                                        }}
                                    />
                                </label>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-slate-300 text-sm font-semibold px-1">Description</label>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-start transition-all focus-within:border-purple-500">
                            <textarea
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 min-h-[120px] p-4 text-base leading-relaxed resize-none outline-none"
                                placeholder="Explain what's happening in this media..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <button
                        onClick={handleSwap}
                        disabled={loading}
                        className="w-full flex items-center justify-center rounded-full h-14 bg-purple-600 text-white text-lg font-bold shadow-xl shadow-purple-600/30 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
                    >
                        {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Share Swap'}
                    </button>
                </section>

                {receivedMedia.length > 0 && (
                    <section className="flex flex-col gap-4 mt-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Camera className="size-5 text-purple-500" />
                            Shared Media
                        </h2>
                        <div className="space-y-6">
                            {receivedMedia.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="aspect-video w-full bg-black/40 flex items-center justify-center border-b border-white/5">
                                        <MediaContent src={item.file_url} alt={item.title} className="w-full h-full" controls />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                                        <p className="text-[10px] text-slate-600 uppercase font-bold mt-4 tracking-widest">
                                            {item.uploader_id === currentUserId ? 'You shared this' : `${peerName} shared this`} • {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </PageWrapper>
    );
}
