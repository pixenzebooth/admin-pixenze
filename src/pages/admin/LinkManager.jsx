import React, { useEffect, useState } from 'react';
import { useAlert } from '../../context/AlertContext';
import { getLinks, addLink, updateLink, deleteLink } from '../../services/links';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Home, ExternalLink, Save, X, GripVertical, CheckCircle, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

// Icon Picker Component
const IconPicker = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const iconList = Object.keys(LucideIcons).filter(key =>
        typeof LucideIcons[key] === 'object' &&
        key !== 'createLucideIcon' &&
        key.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border-2 border-white/20 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-titan text-xl">SELECT ICON</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search icons..."
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-6 gap-4">
                    {iconList.map(name => {
                        const Icon = LucideIcons[name];
                        return (
                            <button
                                key={name}
                                onClick={() => onSelect(name)}
                                className="flex flex-col items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition"
                                title={name}
                            >
                                <Icon size={24} />
                                <span className="text-[10px] text-gray-400 truncate w-full text-center">{name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const LinkManager = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', url: '', icon: 'Link', is_active: true });
    const [showIconPicker, setShowIconPicker] = useState(false);

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const data = await getLinks();
            setLinks(data);
        } catch (error) {
            console.error("Failed to load links:", error);
            showAlert("Failed to load links.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            showAlert("Title and URL are required.", "error");
            return;
        }

        try {
            if (editingId) {
                const updated = await updateLink(editingId, formData);
                setLinks(links.map(l => l.id === editingId ? updated : l));
                showAlert("Link updated!", "success");
            } else {
                const newLink = await addLink({ ...formData, order: links.length });
                setLinks([...links, newLink]);
                showAlert("Link added!", "success");
            }
            resetForm();
        } catch (error) {
            console.error(error);
            showAlert("Failed to save link.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this link?")) return;
        try {
            await deleteLink(id);
            setLinks(links.filter(l => l.id !== id));
            showAlert("Link deleted.", "success");
        } catch (error) {
            showAlert("Failed to delete.", "error");
        }
    };

    const handleEdit = (link) => {
        setEditingId(link.id);
        setFormData({ title: link.title, url: link.url, icon: link.icon, is_active: link.is_active });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ title: '', url: '', icon: 'Link', is_active: true });
    };

    const DynamicIcon = ({ name }) => {
        const Icon = LucideIcons[name] || LucideIcons.Link;
        return <Icon size={20} />;
    };

    // Note: Reorder implementation requires updating 'order' field in DB on drag end
    // For simplicity, we just display list for now. Drag-and-drop can be added if requested.

    return (
        <div className="relative">
            {showIconPicker && (
                <IconPicker
                    onSelect={(icon) => { setFormData({ ...formData, icon }); setShowIconPicker(false); }}
                    onClose={() => setShowIconPicker(false)}
                />
            )}

            <div className="max-w-4xl mx-auto z-10 relative">
                <div className="mb-8">
                    <h1 className="text-3xl font-titan text-game-accent">LINK MANAGER</h1>
                </div>

                {/* EDITOR CARD */}
                <div className="bg-white/10 border-4 border-black p-6 rounded-2xl mb-8 shadow-game">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {editingId ? <Edit className="text-yellow-400" /> : <Plus className="text-green-400" />}
                        {editingId ? 'EDIT LINK' : 'ADD NEW LINK'}
                    </h2>

                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">TITLE</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 focus:border-game-secondary focus:outline-none transition"
                                    placeholder="e.g. My Website"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">URL</label>
                                <input
                                    type="url"
                                    className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 focus:border-game-secondary focus:outline-none transition"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">ICON</label>
                                <button
                                    onClick={() => setShowIconPicker(true)}
                                    className="w-full flex items-center gap-3 bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 hover:bg-white/5 transition"
                                >
                                    <DynamicIcon name={formData.icon} />
                                    <span className="flex-1 text-left">{formData.icon}</span>
                                    <span className="text-xs text-gray-500">CHANGE</span>
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {editingId && (
                                    <button
                                        onClick={resetForm}
                                        className="px-6 py-3 rounded-xl font-bold bg-gray-600 border-2 border-black hover:bg-gray-500 transition"
                                    >
                                        CANCEL
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 rounded-xl font-bold bg-game-success text-black border-2 border-black hover:brightness-110 flex items-center gap-2"
                                >
                                    <Save size={18} /> SAVE LINK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREVIEW & LIST */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 opacity-50">Loading links...</div>
                    ) : (
                        links.map((link, index) => (
                            <motion.div
                                key={link.id}
                                layout
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 border-black/20 ${link.is_active ? 'bg-white/5' : 'bg-red-500/10'}`}
                            >
                                <div className="text-gray-500 font-mono text-xl w-8 text-center">{index + 1}</div>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <DynamicIcon name={link.icon} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg truncate">{link.title}</h3>
                                        {!link.is_active && <span className="text-[10px] bg-red-500 text-white px-2 rounded-full">HIDDEN</span>}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{link.url}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateLink(link.id, { is_active: !link.is_active }).then(loadLinks)}
                                        className={`p-2 rounded hover:bg-white/10 ${link.is_active ? 'text-gray-400' : 'text-red-400'}`}
                                        title={link.is_active ? 'Hide' : 'Show'}
                                    >
                                        {link.is_active ? <Eye /> : <EyeOff />}
                                    </button>
                                    <button onClick={() => handleEdit(link)} className="p-2 text-blue-400 rounded hover:bg-blue-500/20">
                                        <Edit />
                                    </button>
                                    <button onClick={() => handleDelete(link.id)} className="p-2 text-red-400 rounded hover:bg-red-500/20">
                                        <Trash2 />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}

                    {links.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            No links found. Add your first link above!
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LinkManager;
