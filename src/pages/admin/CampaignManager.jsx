import React, { useEffect, useState } from 'react';
import { useAlert } from '../../context/AlertContext';
import { checkCampaignStatus, toggleCampaign, resetCampaign, getWinners } from '../../services/campaignService';
import { RefreshCw, Trophy, Users, Image as ImageIcon, Gift } from 'lucide-react';

const CampaignManager = () => {
    const { showAlert } = useAlert();
    const [campaign, setCampaign] = useState({ active: false, remaining: 0, winners: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCampaign();
    }, []);

    const loadCampaign = async () => {
        setLoading(true);
        try {
            const status = await checkCampaignStatus();
            const winnerList = await getWinners();
            setCampaign({ ...status, winners: winnerList });
        } catch (error) {
            console.error("Failed to load campaign data:", error);
            showAlert("Failed to load campaign data", "error");
        } finally {
            setLoading(false);
        }
    };

    const [processing, setProcessing] = useState(false);

    const handleToggleCampaign = async () => {
        if (processing) return;
        setProcessing(true);

        // Optimistic Update
        const previousState = campaign.active;
        const newState = !previousState;

        setCampaign(prev => ({ ...prev, active: newState }));

        try {
            await toggleCampaign(newState);
            showAlert(newState ? "CAMPAIGN ACTIVATED!" : "CAMPAIGN PAUSED!", "success");
            // Reload just to be safe, but keep quiet about it
            const status = await checkCampaignStatus();
            setCampaign(prev => ({ ...prev, ...status }));
        } catch (error) {
            console.error("Failed to toggle campaign:", error);
            setCampaign(prev => ({ ...prev, active: previousState })); // Revert
            showAlert("Failed to update campaign status. Check network.", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleResetCampaign = async () => {
        if (processing) return;
        if (!confirm("RESET CAMPAIGN? This will clear current winner count (but keep data).")) return;

        setProcessing(true);
        try {
            await resetCampaign();
            // Manually update local state to reflect reset immediately
            setCampaign(prev => ({ ...prev, current_winners: 0, active: false, remaining: 10 }));
            loadCampaign();
            showAlert("CAMPAIGN RESET!", "success");
        } catch (error) {
            console.error(error);
            showAlert("Failed to reset campaign.", "error");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="relative">
            <h1 className="text-3xl font-titan text-game-accent mb-6">CAMPAIGN MANAGER</h1>

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
                            disabled={processing}
                            className={`px-6 py-3 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition flex items-center gap-2 ${campaign.active ? 'bg-red-500 border-red-800' : 'bg-green-500 border-green-800'} ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {processing ? <RefreshCw className="animate-spin" size={18} /> : (campaign.active ? 'STOP CAMPAIGN' : 'START CAMPAIGN')}
                        </button>
                        <button
                            onClick={handleResetCampaign}
                            disabled={processing}
                            className={`px-6 py-3 rounded-xl font-bold bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition text-gray-300 hover:text-white flex items-center gap-2 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw size={18} className={processing ? "animate-spin" : ""} /> RESET
                        </button>
                    </div>
                </div>
            </div>

            {/* WINNERS LIST */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-titan text-yellow-400 flex items-center gap-3">
                        <Trophy className="text-yellow-500" /> HALL OF FAME
                    </h2>
                    <button className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded border border-green-800" onClick={loadCampaign}>
                        REFRESH DATA
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 animate-pulse text-gray-500 font-mono">LOADING DATA...</div>
                ) : campaign.winners.length === 0 ? (
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
        </div>
    );
};

export default CampaignManager;
