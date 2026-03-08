import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Peer, Rating } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Avatar } from './Avatar';

interface RatingModalProps {
    peer: Peer | null;
    currentUserId: string;
    existingRating?: Rating | null;
    onClose: () => void;
    onRatingSubmitted: () => void;
}

function StarRow({ label, value, onChange, readonly }: { label: string; value: number; onChange?: (v: number) => void; readonly?: boolean }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-sm font-semibold text-slate-300">{label}</span>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={cn(
                            "transition-all focus:outline-none",
                            readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
                        )}
                    >
                        <Star
                            className={cn(
                                "size-7 stroke-[1.5px] transition-all",
                                (hovered ? star <= hovered : star <= value)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-transparent text-slate-600"
                            )}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export function RatingModal({ peer, currentUserId, existingRating, onClose, onRatingSubmitted }: RatingModalProps) {
    const [teachingQuality, setTeachingQuality] = useState(existingRating?.teaching_quality ?? 0);
    const [responsiveness, setResponsiveness] = useState(existingRating?.responsiveness ?? 0);
    const [reliability, setReliability] = useState(existingRating?.reliability ?? 0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const isReadOnly = !!existingRating;
    const isValid = teachingQuality > 0 && responsiveness > 0 && reliability > 0;

    // Reset state when peer changes
    useEffect(() => {
        setTeachingQuality(existingRating?.teaching_quality ?? 0);
        setResponsiveness(existingRating?.responsiveness ?? 0);
        setReliability(existingRating?.reliability ?? 0);
        setSubmitting(false);
        setSubmitted(false);
    }, [peer?.id, existingRating]);

    const handleSubmit = async () => {
        if (!peer || !isValid || submitting) return;

        setSubmitting(true);
        const { error } = await supabase.from('ratings').insert({
            rater_id: currentUserId,
            ratee_id: peer.id,
            teaching_quality: teachingQuality,
            responsiveness,
            reliability,
        });

        if (error) {
            console.error('Error submitting rating:', error);
            setSubmitting(false);
            return;
        }

        setSubmitted(true);
        setTimeout(() => {
            onRatingSubmitted();
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {peer && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        key="sheet"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-[#120b1a] border border-white/10 rounded-t-3xl p-6 pb-10 pointer-events-auto">
                            {/* Handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Avatar src={peer.avatarUrl} alt={peer.username} className="size-11 rounded-full border border-purple-500/30" />
                                    <div>
                                        <p className="font-bold text-base">{peer.username}</p>
                                        <p className="text-xs text-slate-500">
                                            {isReadOnly ? 'Your previous rating' : 'Rate your peer'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <X className="size-4 text-slate-400" />
                                </button>
                            </div>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-8 gap-3"
                                >
                                    <CheckCircle className="size-12 text-green-400" />
                                    <p className="text-lg font-bold text-slate-100">Rating Submitted!</p>
                                    <p className="text-sm text-slate-500">Thanks for your feedback.</p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Star rows */}
                                    <div className="bg-white/5 rounded-2xl border border-white/10 px-4 divide-y divide-white/5 mb-6">
                                        <StarRow
                                            label="Teaching Quality"
                                            value={teachingQuality}
                                            onChange={setTeachingQuality}
                                            readonly={isReadOnly}
                                        />
                                        <StarRow
                                            label="Responsiveness"
                                            value={responsiveness}
                                            onChange={setResponsiveness}
                                            readonly={isReadOnly}
                                        />
                                        <StarRow
                                            label="Reliability"
                                            value={reliability}
                                            onChange={setReliability}
                                            readonly={isReadOnly}
                                        />
                                    </div>

                                    {!isReadOnly && (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!isValid || submitting}
                                            className={cn(
                                                "w-full font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm",
                                                isValid && !submitting
                                                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                                                    : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                                            )}
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Rating'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
