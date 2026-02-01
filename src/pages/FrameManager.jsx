import React, { useEffect, useState } from 'react';
import { useAlert } from '../../context/AlertContext';
import { getFrames, deleteFrame, updateFrame } from '../../services/frames';
import { checkCampaignStatus, toggleCampaign, resetCampaign, getWinners } from '../../services/campaignService';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Home, AlertCircle, Sparkles, Gift, RefreshCw, Trophy, Users, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

const FrameManager = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [frames, setFrames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('frames'); // 'frames' | 'winners'
    const [campaign, setCampaign] = useState({ active: false, remaining: 0, winners: [] }); // Campaign State

    useEffect(() => {
        loadFrames();
        loadCampaign();
    }, []);

    const loadCampaign = async () => {
        const status = await checkCampaignStatus();
        const winnerList = await getWinners();
        setCampaign({ ...status, winners: winnerList });
    };

    const loadFrames = async () => {
        try {
            const data = await getFrames();
            setFrames(data);
        } catch (error) {
            console.error("Failed to load frames:", error);
            showAlert("Failed to load frames. Check console.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!confirm("Are you sure you want to delete this frame?")) return;
        try {
            await deleteFrame(id, imageUrl);
            setFrames(frames.filter(f => f.id !== id));
        } catch (error) {
            console.error(error);
            showAlert("Failed to delete.", "error");
        }
    };

    const toggleStatus = async (frame) => {
        const newStatus = frame.status === 'active' ? 'coming_soon' : 'active';
        try {
            const updated = await updateFrame(frame.id, { status: newStatus });
            setFrames(frames.map(f => f.id === frame.id ? updated : f));
        } catch (error) {
            console.error(error);
            showAlert("Failed to update status.", "error");
        }
    };

    const handleToggleCampaign = async () => {
        const newState = !campaign.active;
        await toggleCampaign(newState);
        loadCampaign();
        showAlert(newState ? "CAMPAIGN ACTIVATED!" : "CAMPAIGN PAUSED!", "success");
    };

    const handleResetCampaign = async () => {
        if (!confirm("RESET CAMPAIGN? This will clear current winner count (but keep data).")) return;
        await resetCampaign();
        loadCampaign();
        showAlert("CAMPAIGN RESET!", "success");
    };

    return (
        <div className="min-h-screen font-nunito p-4 md:p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-game-secondary/15 blur-[100px] rounded-full pointer-events-none"
            ></motion.div>

            {/* View Mode Toggle (Floating or Fixed) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border-2 border-white/20 p-2 rounded-full flex gap-2">
                <button
                    onClick={() => setViewMode('frames')}
                    className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${viewMode === 'frames' ? 'bg-game-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <ImageIcon /> FRAMES
                </button>
                <div className="w-[1px] bg-white/20 my-1"></div>
                <button
                    onClick={() => setViewMode('winners')}
                    className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${viewMode === 'winners' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Users /> WINNERS ({campaign.winners.length})
                </button>
            </div>

            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 360]
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute top-20 right-16 md:right-24"
            >
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-game-accent" fill="currentColor" />
            </motion.div>

            <div className="max-w-6xl mx-auto z-10 relative">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/')}
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                        >
                            <Home size={20} />
                        </motion.button>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-2xl sm:text-3xl md:text-4xl font-titan text-game-accent"
                        >
                            ADMIN CONTROL DECK
                        </motion.h1>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/links')}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold border-b-4 border-blue-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition text-sm md:text-base"
                        >
                            <LinkIcon size={18} /> MANAGE LINKS
                        </motion.button>
                        <motion.button
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/frames/new')}
                            className="flex items-center gap-2 bg-game-success text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold border-b-4 border-green-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition text-sm md:text-base"
                        >
                            <Plus size={18} /> UPLOAD NEW FRAME
                        </motion.button>
                    </div>
                </div>

                {/* CAMPAIGN CONTROL CENTER */}
                <div className="bg-game-dark/50 border-4 border-game-accent p-6 rounded-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Gift size={100} />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-titan text-game-accent mb-2 flex items-center gap-2">
                                <Gift /> LUCKY GIVEAWAY SYSTEM
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Manage the "First 10 Wins" campaign.</p>

                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-1 rounded-full text-xs font-bold border ${campaign.active ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-red-500/20 text-red-400 border-red-500'}`}>
                                    STATUS: {campaign.active ? 'ACTIVE (RUNNING)' : 'INACTIVE (PAUSED)'}
                                </div>
                                <div className="text-sm font-mono text-white">
                                    REMAINING SLOTS: <span className="text-yellow-400 font-bold text-xl">{campaign.remaining}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleToggleCampaign}
                                className={`px-6 py-3 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition flex items-center gap-2 ${campaign.active ? 'bg-red-500 border-red-800' : 'bg-green-500 border-green-800'}`}
                            >
                                {campaign.active ? 'STOP CAMPAIGN' : 'START CAMPAIGN'}
                            </button>
                            <button
                                onClick={handleResetCampaign}
                                className="px-6 py-3 rounded-xl font-bold bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition text-gray-300 hover:text-white flex items-center gap-2"
                            >
                                <RefreshCw size={18} /> RESET
                            </button>
                        </div>
                    </div>

                    {/* Winner List Preview (Only in Frames Mode) */}
                    {viewMode === 'frames' && campaign.winners && campaign.winners.length > 0 && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2"><Trophy size={14} /> RECENT WINNERS</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {campaign.winners.slice(0, 5).map(w => (
                                    <div key={w.id} className="min-w-[120px] bg-black/40 p-2 rounded border border-white/5 text-xs opacity-70">
                                        <div className="font-bold text-yellow-500 truncate">{w.name}</div>
                                        <div className="text-[10px] text-gray-600 mt-1">{new Date(w.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                                {campaign.winners.length > 5 && (
                                    <button onClick={() => setViewMode('winners')} className="min-w-[100px] bg-white/5 hover:bg-white/10 p-2 rounded border border-white/5 text-xs flex items-center justify-center text-gray-400">
                                        + See All
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT AREA SWITCHER */}
                {viewMode === 'winners' ? (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-titan text-yellow-400 flex items-center gap-3">
                                <Trophy className="text-yellow-500" /> HALL OF FAME
                            </h2>
                            <button className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded border border-green-800" onClick={loadCampaign}>
                                REFRESH DATA
                            </button>
                        </div>

                        {campaign.winners.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 italic border-2 border-dashed border-gray-800 rounded-xl">
                                No winners yet. Start the campaign to see data here.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/20 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-4">Winner</th>
                                            <th className="p-4">Contact</th>
                                            <th className="p-4">Address</th>
                                            <th className="p-4 text-center">Photo Evidence</th>
                                            <th className="p-4">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {campaign.winners.map((w) => (
                                            <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                                <td className="p-4 font-bold text-yellow-500">{w.name}</td>
                                                <td className="p-4 font-mono text-gray-300">{w.whatsapp}</td>
                                                <td className="p-4 text-gray-400 max-w-[200px] truncate" title={w.address}>{w.address}</td>
                                                <td className="p-4 text-center">
                                                    <a
                                                        href={w.photo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded border border-blue-500/50 transition text-xs font-bold"
                                                    >
                                                        <ImageIcon size={14} /> OPEN PRINT
                                                    </a>
                                                </td>
                                                <td className="p-4 text-gray-500 text-xs font-mono">
                                                    {new Date(w.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* FRAMES GRID IMPL */}

                        {loading ? (
                            <div className="text-center py-20 animate-pulse text-gray-500 font-mono">LOADING SYSTEM DATA...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {frames.map((frame, index) => (
                                    <motion.div
                                        key={frame.id}
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className={`bg-white/10 border-4 border-black rounded-xl p-4 flex flex-col gap-4 relative group shadow-game ${frame.status === 'coming_soon' ? 'opacity-70' : ''}`}
                                    >

                                        <div className="aspect-[2/3] bg-black/50 rounded-lg overflow-hidden relative border border-white/5">
                                            {/* Checkerboard for transparency */}
                                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                                            <img src={frame.image_url} className="w-full h-full object-contain relative z-10" alt={frame.name} />

                                            {frame.status === 'coming_soon' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                    <span className="bg-yellow-400 text-black font-bold px-4 py-1 rounded rotate-12 font-titan tracking-wider border-2 border-white">COMING SOON</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{frame.name}</h3>
                                                <p className="text-xs text-gray-400 font-mono">{new Date(frame.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/frames/edit/${frame.id}`, { state: { frame } })}
                                                    className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition"
                                                    title="Calibrate Layout"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(frame.id, frame.image_url)}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${frame.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500'}`}></div>
                                                <span className="text-xs font-mono uppercase text-gray-400">{frame.status.replace('_', ' ')}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleStatus(frame)}
                                                className="text-xs font-bold underline hover:text-yellow-400"
                                            >
                                                {frame.status === 'active' ? 'SET TO COMING SOON' : 'ACTIVATE'}
                                            </button>
                                        </div>

                                    </motion.div>
                                ))}

                                {frames.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                                        <AlertCircle className="mx-auto mb-4 opacity-50" size={48} />
                                        <p>NO FRAMES DETECTED IN DATABANKS.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
};

export default FrameManager;
